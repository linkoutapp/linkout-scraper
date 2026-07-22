const test = require("node:test");
const assert = require("node:assert/strict");

const {
  clickVisible,
  typeVisible,
} = require("../../lib/interactions/browser-input");

function readyState() {
  return Promise.resolve({ state: "authenticated", stop: false });
}

test("clickVisible uses the ghost cursor before native mouse fallback", async () => {
  const calls = [];
  const target = {
    async boundingBox() {
      return { x: 10, y: 20, width: 40, height: 20 };
    },
  };
  const page = {
    cursor: {
      async click(value) {
        calls.push(["cursor", value]);
      },
    },
    mouse: {
      async move() {
        calls.push(["mouse-move"]);
      },
      async click() {
        calls.push(["mouse-click"]);
      },
    },
  };

  await clickVisible(page, target, { detectState: readyState, delay: 0 });
  assert.deepEqual(calls, [["cursor", target]]);
});

test("clickVisible falls back to native mouse coordinates", async () => {
  const calls = [];
  const target = {
    async boundingBox() {
      return { x: 10, y: 20, width: 40, height: 20 };
    },
  };
  const page = {
    mouse: {
      async move(x, y, options) {
        calls.push(["move", x, y, options]);
      },
      async click(x, y) {
        calls.push(["click", x, y]);
      },
    },
  };

  await clickVisible(page, target, { detectState: readyState, delay: 0 });
  assert.deepEqual(calls, [
    ["move", 30, 30, { steps: 12 }],
    ["click", 30, 30],
  ]);
});

test("clickVisible uses native coordinates for a child-frame target", async () => {
  const calls = [];
  const target = {
    async boundingBox() {
      return { x: 20, y: 30, width: 20, height: 10 };
    },
  };
  const page = {
    cursor: {
      async click() {
        assert.fail("ghost cursor must not click child-frame targets");
      },
    },
    mouse: {
      async move(x, y) {
        calls.push(["move", x, y]);
      },
      async click(x, y) {
        calls.push(["click", x, y]);
      },
    },
  };

  await clickVisible(page, target, {
    detectState: readyState,
    delay: 0,
    preferNative: true,
  });

  assert.deepEqual(calls, [
    ["move", 30, 35],
    ["click", 30, 35],
  ]);
});

test("typeVisible emits per-character native keyboard input", async () => {
  const calls = [];
  const page = {
    async focus(selector) {
      calls.push(["focus", selector]);
    },
    keyboard: {
      async type(value, options) {
        calls.push(["type", value, options]);
      },
    },
  };

  await typeVisible(page, "#editor", "Hi!", {
    detectState: readyState,
    minDelay: 30,
    maxDelay: 30,
    random: () => 0,
  });

  assert.deepEqual(calls, [
    ["focus", "#editor"],
    ["type", "H", { delay: 30 }],
    ["type", "i", { delay: 30 }],
    ["type", "!", { delay: 30 }],
  ]);
});

test("typeVisible focuses the resolved child context", async () => {
  const calls = [];
  const context = {
    async focus(selector) {
      calls.push(["context-focus", selector]);
    },
  };
  const page = {
    async focus() {
      assert.fail("top-level page must not be focused");
    },
    keyboard: {
      async type(value) {
        calls.push(["type", value]);
      },
    },
  };

  await typeVisible(page, "#editor", "Hi", {
    context,
    detectState: readyState,
    minDelay: 0,
    maxDelay: 0,
  });

  assert.deepEqual(calls, [
    ["context-focus", "#editor"],
    ["type", "H"],
    ["type", "i"],
  ]);
});

test("typeVisible replaces an existing draft before typing", async () => {
  const calls = [];
  const page = {
    async focus(selector) {
      calls.push(["focus", selector]);
    },
    keyboard: {
      async press(value) {
        calls.push(["press", value]);
      },
      async type(value) {
        calls.push(["type", value]);
      },
    },
  };

  await typeVisible(page, "#editor", "Hi", {
    detectState: readyState,
    minDelay: 0,
    maxDelay: 0,
    replace: true,
  });

  assert.deepEqual(calls, [
    ["focus", "#editor"],
    ["press", "Meta+A"],
    ["press", "Backspace"],
    ["type", "H"],
    ["type", "i"],
  ]);
});

test("input stops before interacting with a challenged page", async () => {
  const page = { cursor: { click: async () => assert.fail("must not click") } };
  await assert.rejects(
    clickVisible(page, {}, {
      detectState: async () => ({ state: "checkpoint", stop: true }),
      delay: 0,
    }),
    (error) => error.code === "PAGE_STATE_STOP"
  );
});
