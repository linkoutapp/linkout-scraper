const fs = require("node:fs/promises");
const path = require("node:path");
const LinkoutError = require("../errors/linkout-error");

function hasBudget(entries, entry, limit) {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new LinkoutError("INVALID_DAILY_LIMIT", "dailyLimit must be a non-negative safe integer");
  }
  return entries.filter(row => row.operation === entry.operation &&
    row.localDate === entry.localDate &&
    (row.outcome === "reserved" || (row.outcome === "success" && !row.actionId))
  ).length < limit;
}

function canonicalTarget(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:" || url.hostname !== "www.linkedin.com") return "";
    return `${url.origin}${url.pathname}`;
  } catch (_) {
    return "";
  }
}

function sanitizeLedgerEntry(entry = {}) {
  const sanitized = {
    timestamp: String(entry.timestamp || ""),
    operation: String(entry.operation || ""),
    target: canonicalTarget(entry.target),
    outcome: String(entry.outcome || ""),
    errorCode: String(entry.errorCode || ""),
  };
  if (entry.localDate) sanitized.localDate = String(entry.localDate);
  if (entry.actionId) sanitized.actionId = String(entry.actionId);
  return sanitized;
}

function createLedger({ stateDirectory, filename = "actions.jsonl" }) {
  if (!stateDirectory) throw new TypeError("stateDirectory is required");
  const file = path.join(stateDirectory, filename);

  async function read() {
    try {
      const contents = await fs.readFile(file, "utf8");
      return contents
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async function append(entry) {
    await fs.mkdir(stateDirectory, { recursive: true, mode: 0o700 });
    await fs.appendFile(file, `${JSON.stringify(sanitizeLedgerEntry(entry))}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  }

  async function countSuccessful(operation, localDate) {
    const entries = await read();
    return entries.filter(
      (entry) =>
        entry.operation === operation &&
        entry.localDate === localDate &&
        entry.outcome === "success"
    ).length;
  }

  async function reserve(entry, limit) {
    await fs.mkdir(stateDirectory, {recursive: true, mode: 0o700});
    let lock;
    try {
      lock = await fs.open(`${file}.lock`, "wx", 0o600);
    } catch (error) {
      if (error.code === "EEXIST") {
        throw new LinkoutError("LEDGER_BUSY", "The action ledger is locked; no action was admitted");
      }
      throw error;
    }
    try {
      if (!hasBudget(await read(), entry, limit)) return false;
      await append({...entry, outcome: "reserved"});
      return true;
    } finally {
      await lock.close();
      await fs.unlink(`${file}.lock`);
    }
  }

  return { append, countSuccessful, file, read, reserve };
}

module.exports = {
  canonicalTarget,
  createLedger,
  hasBudget,
  sanitizeLedgerEntry,
};
