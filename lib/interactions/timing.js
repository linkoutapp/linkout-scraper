function boundedRandom(minimum, maximum, random = Math.random) {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum > maximum) {
    throw new RangeError("minimum must be less than or equal to maximum");
  }
  const value = Math.min(Math.max(Number(random()), 0), 0.999999999999);
  return Math.floor(value * (maximum - minimum + 1)) + minimum;
}

function jitteredDelay(base, { jitter = 0, random = Math.random } = {}) {
  const safeBase = Math.max(0, Number(base) || 0);
  const safeJitter = Math.max(0, Number(jitter) || 0);
  return Math.max(
    0,
    Math.round(safeBase + boundedRandom(-safeJitter, safeJitter, random))
  );
}

async function sleep(milliseconds) {
  const delay = Math.max(0, Number(milliseconds) || 0);
  if (delay === 0) return;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

module.exports = {
  boundedRandom,
  jitteredDelay,
  sleep,
};
