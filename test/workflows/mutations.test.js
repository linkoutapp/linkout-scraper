const test = require("node:test");
const assert = require("node:assert/strict");

const connect = require("../../lib/linkedin/linkedin.connect.service");
const message = require("../../lib/linkedin/linkedin.message.service");
const like = require("../../lib/linkedin/linkedin.like.service");
const endorse = require("../../lib/linkedin/linkedin.endorse.service");

function element(text = "") {
  return {
    async evaluate(callback) {
      return callback({ textContent: text });
    },
    async boundingBox() {
      return { x: 1, y: 2, width: 10, height: 10 };
    },
  };
}

function mutationPage(selectors = {}) {
  const calls = [];
  const page = {
    calls,
    frames: () => [],
    url: () => page.currentUrl || "https://www.linkedin.com/feed/",
    async goto(url) {
      calls.push(["goto", url]);
      page.currentUrl = url;
    },
    async $(selector) {
      calls.push(["query", selector]);
      return selectors[selector] || null;
    },
    async evaluate() {
      return {
        text: "Home My Network",
        hasAuthenticatedUi: true,
        unexpectedModal: false,
      };
    },
    async focus(selector) {
      calls.push(["focus", selector]);
    },
    keyboard: {
      async type(value) {
        calls.push(["type", value]);
      },
    },
    cursor: {
      async click(target) {
        calls.push(["click", target]);
      },
    },
  };
  return page;
}

function recordingPolicy() {
  const calls = [];
  return {
    calls,
    async begin(input) {
      calls.push(["begin", input.operation, input.confirm, input.target]);
      if (!input.confirm) {
        const error = new Error("confirmation required");
        error.code = "CONFIRMATION_REQUIRED";
        throw error;
      }
      return {
        async complete() {
          calls.push(["complete", input.operation]);
        },
        async reject(code) {
          calls.push(["reject", input.operation, code]);
        },
      };
    },
  };
}

test("connect uses the 2026 semantic connect and success selectors", async () => {
  const primary = element();
  const send = element();
  const pending = element();
  const page = mutationPage({
    main: element(),
    "main h2": element("Ada Lovelace"),
    'main button[aria-label*="Invite"][aria-label*="connect"]': primary,
    'button[aria-label*="Send invitation"]:not(:disabled)': send,
    'main button[aria-label*="Pending"]': pending,
  });
  const policy = recordingPolicy();

  const result = await connect(page, { actionPolicy: policy }, {
    url: "https://www.linkedin.com/in/ada/",
    confirm: true,
    timeout: 0,
    clickDelay: 0,
  });

  assert.equal(result.status, "sent");
  assert.deepEqual(
    page.calls.filter(([name]) => name === "click").map(([, target]) => target),
    [primary, send]
  );
  assert.deepEqual(policy.calls.at(-1), ["complete", "connect"]);
});

test("message types through the current contenteditable and verifies a sent event", async () => {
  const open = element();
  const editor = element();
  const send = element();
  const success = element();
  const page = mutationPage({
    main: element(),
    "main h2": element("Ada Lovelace"),
    'main a[href*="/messaging/thread/"]': open,
    '[role="textbox"][contenteditable="true"]': editor,
    'button[type="submit"][aria-label*="Send"]:not(:disabled)': send,
    'main li:has(time):has(p)': success,
  });
  const policy = recordingPolicy();

  const result = await message(page, { actionPolicy: policy }, {
    url: "https://www.linkedin.com/in/ada/",
    message: "Hello {{firstName}}",
    confirm: true,
    timeout: 0,
    minDelay: 0,
    maxDelay: 0,
    clickDelay: 0,
  });

  assert.equal(result.status, "sent");
  assert.equal(
    page.calls.filter(([name]) => name === "type").map(([, value]) => value).join(""),
    "Hello Ada"
  );
  assert.deepEqual(policy.calls.at(-1), ["complete", "message"]);
});

test("like and endorse use semantic current selectors and success states", async () => {
  for (const [service, operation, current, success] of [
    [
      like,
      "like",
      'button[aria-pressed="false"][aria-label*="Like"]',
      'button[aria-pressed="true"][aria-label*="Like"]',
    ],
    [
      endorse,
      "endorse",
      'main button[aria-label^="Endorse "]',
      'main button[aria-label^="Remove endorsement"]',
    ],
  ]) {
    const control = element();
    const page = mutationPage({
      main: element(),
      [current]: control,
      [success]: element(),
    });
    const policy = recordingPolicy();
    const result = await service(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/ada/",
      confirm: true,
      timeout: 0,
      clickDelay: 0,
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(
      page.calls.filter(([name]) => name === "click").map(([, target]) => target),
      [control]
    );
    assert.deepEqual(policy.calls.at(-1), ["complete", operation]);
  }
});

test("an unconfirmed action never clicks", async () => {
  const page = mutationPage({
    main: element(),
    "main h2": element("Ada Lovelace"),
  });
  const policy = recordingPolicy();
  await assert.rejects(
    connect(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/ada/",
      timeout: 0,
    }),
    (error) => error.code === "CONFIRMATION_REQUIRED"
  );
  assert.equal(page.calls.some(([name]) => name === "click"), false);
});
