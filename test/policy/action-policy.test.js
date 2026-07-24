const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createActionPolicy,
  createMemoryLedger,
} = require("../../lib/policy/action-policy");
const defaults = require("../../lib/policy/defaults");

function config(overrides = {}) {
  return {
    operatingHours: { start: 9, end: 18 },
    operations: {
      connect: { enabled: true, dailyLimit: 1 },
      ...overrides,
    },
  };
}

function clockAt(hour, day = 22) {
  return () => new Date(2026, 6, day, hour, 0, 0);
}

test("mutations require explicit confirmation and enabled operation", async () => {
  const policy = createActionPolicy({
    config: config(),
    ledger: createMemoryLedger(),
    clock: clockAt(10),
    detectState: async () => ({ state: "authenticated", stop: false }),
  });
  await assert.rejects(
    policy.begin({ operation: "connect", target: "https://www.linkedin.com/in/a/" }),
    (error) => error.code === "CONFIRMATION_REQUIRED"
  );

  const disabled = createActionPolicy({
    config: config({ connect: { enabled: false, dailyLimit: 1 } }),
    ledger: createMemoryLedger(),
    clock: clockAt(10),
    detectState: async () => ({ state: "authenticated", stop: false }),
  });
  await assert.rejects(
    disabled.begin({
      operation: "connect",
      target: "https://www.linkedin.com/in/a/",
      confirm: true,
    }),
    (error) => error.code === "OPERATION_DISABLED"
  );
});

test("mutations stop outside hours, at the daily limit, and on a challenge", async () => {
  const outsideHours = createActionPolicy({
    config: config(),
    ledger: createMemoryLedger(),
    clock: clockAt(20),
    detectState: async () => ({ state: "authenticated", stop: false }),
  });
  await assert.rejects(
    outsideHours.begin({ operation: "connect", target: "x", confirm: true }),
    (error) => error.code === "OUTSIDE_OPERATING_HOURS"
  );

  const ledger = createMemoryLedger([
    { localDate: "2026-07-22", operation: "connect", outcome: "success" },
  ]);
  const limited = createActionPolicy({
    config: config(),
    ledger,
    clock: clockAt(10),
    detectState: async () => ({ state: "authenticated", stop: false }),
  });
  await assert.rejects(
    limited.begin({ operation: "connect", target: "x", confirm: true }),
    (error) => error.code === "DAILY_LIMIT_REACHED"
  );

  const challenged = createActionPolicy({
    config: config(),
    ledger: createMemoryLedger(),
    clock: clockAt(10),
    detectState: async () => ({ state: "checkpoint", stop: true }),
  });
  await assert.rejects(
    challenged.begin({ operation: "connect", target: "x", confirm: true, page: {} }),
    (error) => error.code === "PAGE_STATE_STOP"
  );
});

test("successful completion consumes budget and date rollover resets it", async () => {
  const ledger = createMemoryLedger();
  let current = new Date(2026, 6, 22, 10, 0, 0);
  const policy = createActionPolicy({
    config: config(),
    ledger,
    clock: () => current,
    detectState: async () => ({ state: "authenticated", stop: false }),
  });

  const transaction = await policy.begin({
    operation: "connect",
    target: "https://www.linkedin.com/in/a/?secret=x",
    confirm: true,
    page: {},
  });
  assert.equal(await ledger.countSuccessful("connect", "2026-07-22"), 0);
  await transaction.complete();
  assert.equal(await ledger.countSuccessful("connect", "2026-07-22"), 1);

  current = new Date(2026, 6, 23, 10, 0, 0);
  const next = await policy.begin({
    operation: "connect",
    target: "https://www.linkedin.com/in/b/",
    confirm: true,
    page: {},
  });
  await next.reject("NO_SUCCESS_STATE");
  assert.equal(await ledger.countSuccessful("connect", "2026-07-23"), 0);
});

test("default policy exposes only supported mutation operations", () => {
  assert.deepEqual(Object.keys(defaults.operations).sort(), [
    "connect",
    "endorse",
    "like",
    "message",
  ]);
});
