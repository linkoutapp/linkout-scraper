const fs = require("node:fs/promises");
const path = require("node:path");

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

  return { append, countSuccessful, file, read };
}

module.exports = {
  canonicalTarget,
  createLedger,
  sanitizeLedgerEntry,
};
