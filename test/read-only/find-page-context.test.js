const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findPageContext,
  findFirstSelector,
  waitForPageContext,
} = require("../../lib/helpers/find-page-context");

function context(matches = {}) {
  return {
    async $(selector) {
      return matches[selector] || null;
    },
  };
}

test("findPageContext checks the page before child frames", async () => {
  const page = Object.assign(context({ main: { id: "page" } }), {
    frames: () => [context({ main: { id: "frame" } })],
  });

  assert.equal(await findPageContext(page, ["main"]), page);
});

test("findPageContext finds a matching child frame", async () => {
  const frame = context({ main: { id: "frame" } });
  const page = Object.assign(context(), { frames: () => [page, frame] });

  assert.equal(await findPageContext(page, ["main"]), frame);
});

test("findFirstSelector returns candidates in priority order", async () => {
  const target = context({ ".legacy": {}, '[role="main"]': {} });

  assert.equal(
    await findFirstSelector(target, ['[role="main"]', ".legacy"]),
    '[role="main"]'
  );
});

test("findPageContext returns null when no candidate matches", async () => {
  const page = Object.assign(context(), { frames: () => [] });

  assert.equal(await findPageContext(page, ["main"]), null);
});

test("findPageContext skips child frames detached during selector lookup", async () => {
  const detachedMessages = [
    "Attempted to use detached Frame 'frame-id'",
    "Protocol error (DOM.describeNode): Cannot find context with specified id",
    "Execution context was destroyed, most likely because of a navigation",
    "Execution context is not available in detached frame or worker 'frame-id'",
  ];
  const detachedFrames = detachedMessages.map((message) => ({
    async $() {
      throw new Error(message);
    },
  }));
  const stableFrame = context({ main: { id: "stable" } });
  const page = Object.assign(context(), {
    frames: () => [page, ...detachedFrames, stableFrame],
  });

  assert.equal(await findPageContext(page, ["main"]), stableFrame);
});

test("findPageContext preserves transient failures from the main page", async () => {
  const failure = new Error(
    "Execution context was destroyed, most likely because of a navigation"
  );
  const page = {
    frames: () => [page, context({ main: { id: "frame" } })],
    async $() {
      throw failure;
    },
  };

  await assert.rejects(() => findPageContext(page, ["main"]), failure);
});

test("findPageContext preserves unexpected child-frame failures", async () => {
  const failure = new Error("CDP session closed unexpectedly");
  const frame = {
    async $() {
      throw failure;
    },
  };
  const page = Object.assign(context(), { frames: () => [page, frame] });

  await assert.rejects(() => findPageContext(page, ["main"]), failure);
});

test("waitForPageContext retries until dynamic content appears", async () => {
  let attempts = 0;
  const page = {
    frames: () => [],
    async $() {
      attempts += 1;
      return attempts >= 3 ? {} : null;
    },
  };

  assert.equal(
    await waitForPageContext(page, ["main"], { timeout: 100, interval: 0 }),
    page
  );
  assert.equal(attempts, 3);
});
