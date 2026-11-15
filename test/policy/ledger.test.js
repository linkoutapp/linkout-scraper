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

test("independent file ledgers reserve at most one slot and retain it after reopen", async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "linkout-reserve-"));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const ledgers = [0, 1].map(() => createLedger({stateDirectory: directory}));
  const entry = {operation: "connect", localDate: "2026-11-15", outcome: "reserved", actionId: "a"};
  const results = await Promise.allSettled(ledgers.map(ledger => ledger.reserve(entry, 1)));
  assert.equal(results.filter(r => r.status === "fulfilled" && r.value === true).length, 1);
  assert.equal(await createLedger({stateDirectory: directory}).reserve(entry, 1), false);
});

test("a stale ledger lock fails closed without deleting another writer's lock", async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "linkout-lock-"));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const ledger = createLedger({stateDirectory: directory});
  fs.writeFileSync(`${ledger.file}.lock`, '');
  await assert.rejects(ledger.reserve({operation: "message", localDate: "2026-11-15"}, 1),
    error => error.code === "LEDGER_BUSY");
  assert.equal(fs.existsSync(`${ledger.file}.lock`), true);
});

test("separate processes sharing a ledger cannot overbook a slot", async t => {
  const {promisify} = require("node:util");
  const execFile = promisify(require("node:child_process").execFile);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "linkout-processes-"));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const script = `
    const {createLedger} = require(process.argv[1]);
    createLedger({stateDirectory: process.argv[2]}).reserve({
      operation: 'connect', localDate: '2026-11-15', actionId: process.pid,
    }, 1).then(ok => process.stdout.write(ok ? '1' : '0')).catch(error => {
      if (error.code !== 'LEDGER_BUSY') throw error;
      process.stdout.write('0');
    });`;
  const results = await Promise.all([0, 1].map(() => execFile(process.execPath,
    ['-e', script, require.resolve('../../lib/policy/ledger'), directory])));
  assert.equal(results.reduce((sum, result) => sum + Number(result.stdout), 0), 1);
});
