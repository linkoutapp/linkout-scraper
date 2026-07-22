const test = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveSelector,
  sanitizePageUrl,
} = require("../../lib/helpers/find-page-context");

function handle(visible = true) {
  return {
    async isIntersectingViewport() {
      return visible;
    },
  };
}

function context(matches = {}) {
  return {
    async $(selector) {
      return matches[selector] || null;
    },
  };
}

test("resolveSelector returns the first matching visible candidate", async () => {
  const hidden = handle(false);
  const visible = handle(true);
  const page = Object.assign(
    context({ ".hidden": hidden, '[role="main"]': visible }),
    {
      frames: () => [],
      url: () => "https://www.linkedin.com/in/example/?secret=value",
    }
  );

  const result = await resolveSelector(page, {
    workflow: "profile",
    name: "root",
    candidates: [".hidden", '[role="main"]'],
    visible: true,
    timeout: 0,
  });

  assert.equal(result.context, page);
  assert.equal(result.selector, '[role="main"]');
  assert.equal(result.handle, visible);
});

test("resolveSelector searches child frames", async () => {
  const target = handle();
  const frame = context({ "main h2": target });
  const page = Object.assign(context(), {
    frames: () => [page, frame],
    url: () => "https://www.linkedin.com/in/example/",
  });

  const result = await resolveSelector(page, {
    workflow: "profile",
    name: "name",
    candidates: ["main h2"],
    timeout: 0,
  });

  assert.equal(result.context, frame);
  assert.equal(result.handle, target);
});

test("resolveSelector retries until a candidate appears", async () => {
  let attempts = 0;
  const target = handle();
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/feed/",
    async $() {
      attempts += 1;
      return attempts >= 2 ? target : null;
    },
  };

  const result = await resolveSelector(page, {
    workflow: "feed",
    name: "root",
    candidates: ["main"],
    timeout: 30,
    interval: 1,
  });

  assert.equal(result.handle, target);
  assert.equal(attempts, 2);
});

test("resolveSelector throws a structured redacted bounded error", async () => {
  const page = Object.assign(context(), {
    frames: () => [],
    url: () =>
      "https://www.linkedin.com/messaging/thread/abc/?searchTerm=private#secret",
  });

  await assert.rejects(
    resolveSelector(page, {
      workflow: "messages",
      name: "conversation",
      candidates: ["main li:has(time)"],
      timeout: 0,
    }),
    (error) => {
      assert.equal(error.name, "LinkoutError");
      assert.equal(error.code, "SELECTOR_NOT_FOUND");
      assert.equal(error.details.workflow, "messages");
      assert.equal(error.details.element, "conversation");
      assert.equal(error.details.timeout, 0);
      assert.equal(
        error.details.url,
        "https://www.linkedin.com/messaging/thread/abc/"
      );
      assert.equal(JSON.stringify(error).includes("searchTerm"), false);
      assert.equal(JSON.stringify(error).includes("private"), false);
      return true;
    }
  );
});

test("sanitizePageUrl accepts sync, async, and malformed page URLs", async () => {
  assert.equal(
    await sanitizePageUrl({ url: () => "https://www.linkedin.com/feed/?token=x" }),
    "https://www.linkedin.com/feed/"
  );
  assert.equal(
    await sanitizePageUrl({ url: async () => "https://www.linkedin.com/in/a/#x" }),
    "https://www.linkedin.com/in/a/"
  );
  assert.equal(await sanitizePageUrl({ url: () => "not a url" }), "");
});
