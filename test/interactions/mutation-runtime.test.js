const test = require("node:test");
const assert = require("node:assert/strict");

const { interactionOptions } = require("../../lib/linkedin/mutation-runtime");

test("mutation interaction options require ghost cursor and include post-action jitter", () => {
  const options = interactionOptions({
    random: () => 0.5,
  });

  assert.equal(options.requireCursor, true);
  assert.equal(options.delay >= 250 && options.delay <= 650, true);
  assert.equal(options.postDelay >= 200 && options.postDelay <= 500, true);
});

test("mutation interaction options allow explicit test overrides", () => {
  assert.deepEqual(
    interactionOptions({
      clickDelay: 0,
      clickPostDelay: 0,
      requireCursor: false,
    }),
    {
      detectState: undefined,
      delay: 0,
      postDelay: 0,
      requireCursor: false,
    }
  );
});
