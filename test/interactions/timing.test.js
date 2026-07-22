const test = require("node:test");
const assert = require("node:assert/strict");

const {
  boundedRandom,
  jitteredDelay,
} = require("../../lib/interactions/timing");

test("boundedRandom is injectable and stays within inclusive bounds", () => {
  assert.equal(boundedRandom(10, 20, () => 0), 10);
  assert.equal(boundedRandom(10, 20, () => 0.999999), 20);
  assert.throws(() => boundedRandom(20, 10), /minimum/i);
});

test("jitteredDelay never returns a negative duration", () => {
  assert.equal(jitteredDelay(100, { jitter: 1000, random: () => 0 }), 0);
  assert.equal(jitteredDelay(100, { jitter: 20, random: () => 0.5 }), 100);
});
