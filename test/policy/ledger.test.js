const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  createLedger,
  sanitizeLedgerEntry,
} = require("../../lib/policy/ledger");

test("sanitizeLedgerEntry keeps operational metadata and removes secrets", () => {
  const entry = sanitizeLedgerEntry({
    timestamp: "2026-07-22T10:00:00.000Z",
    operation: "message",
    target: "https://www.linkedin.com/in/example/?tracking=secret",
    outcome: "success",
    errorCode: "",
    message: "private message",
    cookie: "li_at=secret",
    code: "123456",
  });

  assert.deepEqual(entry, {
    timestamp: "2026-07-22T10:00:00.000Z",
    operation: "message",
    target: "https://www.linkedin.com/in/example/",
    outcome: "success",
    errorCode: "",
  });
  const serialized = JSON.stringify(entry);
  assert.equal(serialized.includes("private message"), false);
  assert.equal(serialized.includes("li_at"), false);
  assert.equal(serialized.includes("123456"), false);
});

test("ledger appends JSON lines and counts only successful actions by local date", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "linkout-ledger-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const ledger = createLedger({ stateDirectory: directory });

  await ledger.append({
    timestamp: "2026-07-22T10:00:00.000Z",
    localDate: "2026-07-22",
    operation: "connect",
    target: "https://www.linkedin.com/in/a/",
    outcome: "success",
  });
  await ledger.append({
    timestamp: "2026-07-22T11:00:00.000Z",
    localDate: "2026-07-22",
    operation: "connect",
    target: "https://www.linkedin.com/in/b/",
    outcome: "rejected",
  });
  await ledger.append({
    timestamp: "2026-07-23T10:00:00.000Z",
    localDate: "2026-07-23",
    operation: "connect",
    target: "https://www.linkedin.com/in/c/",
    outcome: "success",
  });

  assert.equal(await ledger.countSuccessful("connect", "2026-07-22"), 1);
  assert.equal(await ledger.countSuccessful("connect", "2026-07-23"), 1);
  assert.equal((await ledger.read()).length, 3);
});
