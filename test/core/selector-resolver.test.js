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

test("resolveSelector skips an earlier hidden match for the same candidate", async () => {
  const hidden = handle(false);
  const visible = handle(true);
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/in/example/recent-activity/all/",
    async $() {
      return hidden;
    },
    async $$() {
      return [hidden, visible];
    },
  };

  const result = await resolveSelector(page, {
    workflow: "like",
    name: "button",
    candidates: ['button[aria-label="React Like"]'],
    visible: true,
    timeout: 0,
  });

  assert.equal(result.selector, 'button[aria-label="React Like"]');
  assert.equal(result.handle, visible);
});

test("resolveSelector disposes every unselected handle", async () => {
  const disposed = [];
  const tracked = (label, visible) => ({
    async isVisible() {
      return visible;
    },
    async isIntersectingViewport() {
      return visible;
    },
    async dispose() {
      disposed.push(label);
    },
  });
  const hidden = tracked("hidden", false);
  const selected = tracked("selected", true);
  const trailing = tracked("trailing", true);
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/in/example/",
    async $$() {
      return [hidden, selected, trailing];
    },
  };

  const result = await resolveSelector(page, {
    workflow: "like",
    name: "button",
    candidates: ['button[aria-label="React Like"]'],
    visible: true,
    timeout: 0,
  });

  assert.equal(result.handle, selected);
  assert.deepEqual(disposed.sort(), ["hidden", "trailing"]);
});

test("resolveSelector disposes materialized handles when visibility probing fails", async () => {
  const failure = new Error("CDP session closed unexpectedly");
  const disposed = [];
  const broken = {
    async isVisible() {
      throw failure;
    },
    async dispose() {
      disposed.push("broken");
    },
  };
  const trailing = {
    async dispose() {
      disposed.push("trailing");
    },
  };
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/in/example/",
    async $$() {
      return [broken, trailing];
    },
  };

  await assert.rejects(
    resolveSelector(page, {
      workflow: "like",
      name: "button",
      candidates: ['button[aria-label="React Like"]'],
      visible: true,
      timeout: 0,
    }),
    failure
  );
  assert.deepEqual(disposed.sort(), ["broken", "trailing"]);
});

test("resolveSelector can return a rendered offscreen action target", async () => {
  const offscreen = {
    async isIntersectingViewport() {
      return false;
    },
    async boundingBox() {
      return { x: 20, y: 1350, width: 80, height: 40 };
    },
  };
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/in/example/recent-activity/all/",
    async $$() {
      return [offscreen];
    },
  };

  const result = await resolveSelector(page, {
    workflow: "like",
    name: "button",
    candidates: ['button[aria-label="React Like"]'],
    visible: true,
    allowOffscreen: true,
    timeout: 0,
  });

  assert.equal(result.handle, offscreen);
});

test("resolveSelector rejects a CSS-hidden control with geometry", async () => {
  const hidden = {
    async isVisible() {
      return false;
    },
    async isIntersectingViewport() {
      return true;
    },
    async boundingBox() {
      return { x: 20, y: 20, width: 80, height: 40 };
    },
  };
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/in/example/recent-activity/all/",
    async $$() {
      return [hidden];
    },
  };

  await assert.rejects(
    resolveSelector(page, {
      workflow: "like",
      name: "button",
      candidates: ['button[aria-label="React Like"]'],
      visible: true,
      allowOffscreen: true,
      timeout: 0,
    }),
    (error) => error.code === "SELECTOR_NOT_FOUND"
  );
});

test("resolveSelector preserves unexpected handle visibility failures", async () => {
  const failure = new Error("CDP session closed unexpectedly");
  const handles = [
    {
      async isVisible() {
        throw failure;
      },
      async isIntersectingViewport() {
        return true;
      },
    },
    {
      async isVisible() {
        return true;
      },
      async isIntersectingViewport() {
        throw failure;
      },
    },
    {
      async isVisible() {
        return true;
      },
      async isIntersectingViewport() {
        return false;
      },
      async boundingBox() {
        throw failure;
      },
    },
  ];

  for (const handle of handles) {
    const page = {
      frames: () => [],
      url: () => "https://www.linkedin.com/in/example/",
      async $$() {
        return [handle];
      },
    };

    await assert.rejects(
      resolveSelector(page, {
        workflow: "like",
        name: "button",
        candidates: ['button[aria-label="React Like"]'],
        visible: true,
        allowOffscreen: true,
        timeout: 0,
      }),
      failure
    );
  }
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

test("resolveSelector skips detached child frames and finds a stable frame", async () => {
  const target = handle();
  const detachedFrame = {
    async $() {
      throw new Error("Attempted to use detached Frame 'stale-frame'");
    },
  };
  const stableFrame = context({ "main h2": target });
  const page = Object.assign(context(), {
    frames: () => [page, detachedFrame, stableFrame],
    url: () => "https://www.linkedin.com/in/example/",
  });

  const result = await resolveSelector(page, {
    workflow: "profile",
    name: "name",
    candidates: ["main h2"],
    timeout: 0,
  });

  assert.equal(result.context, stableFrame);
  assert.equal(result.handle, target);
});

test("resolveSelector skips child frames with stalled selector lookup", async () => {
  const target = handle();
  const stalledFrame = {
    async $$() {
      return new Promise(() => {});
    },
  };
  const stableFrame = context({ "main h2": target });
  const page = Object.assign(context(), {
    frames: () => [page, stalledFrame, stableFrame],
    url: () => "https://www.linkedin.com/in/example/",
  });

  const result = await resolveSelector(page, {
    workflow: "profile",
    name: "name",
    candidates: ["main h2"],
    timeout: 50,
    interval: 1,
  });

  assert.equal(result.context, stableFrame);
  assert.equal(result.handle, target);
});

test("resolveSelector gives slow main-page lookups at least one second", async () => {
  const target = handle();
  const page = {
    frames: () => [],
    url: () => "https://www.linkedin.com/in/example/",
    async $$() {
      await new Promise((resolve) => setTimeout(resolve, 60));
      return [target];
    },
  };

  const result = await resolveSelector(page, {
    workflow: "connect",
    name: "primary",
    candidates: ['a[href*="/preload/custom-invite/"]'],
    timeout: 10000,
    interval: 250,
    visible: true,
  });

  assert.equal(result.handle, target);
});

test("resolveSelector preserves unexpected child-frame failures", async () => {
  const failure = new Error("CDP session closed unexpectedly");
  const frame = {
    async $() {
      throw failure;
    },
  };
  const page = Object.assign(context(), {
    frames: () => [page, frame],
    url: () => "https://www.linkedin.com/in/example/",
  });

  await assert.rejects(
    resolveSelector(page, {
      workflow: "profile",
      name: "name",
      candidates: ["main h2"],
      timeout: 0,
    }),
    failure
  );
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
    timeout: 1000,
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
