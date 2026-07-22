const { jitteredDelay, sleep } = require("../interactions/timing");

async function timer(milliseconds) {
  const base = Math.max(0, Number(milliseconds) || 0);
  return sleep(jitteredDelay(base, { jitter: Math.min(base, 1000) }));
}

module.exports = timer;
