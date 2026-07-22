const test = require("node:test");
const assert = require("node:assert/strict");

const messagesFromChat = require(
  "../../lib/linkedin/linkedin.messages.from.chat.service"
);
const { normalizeMessageRows } = messagesFromChat;

function messagingPage(rows, header = { name: "Nithis", img: "avatar.png" }) {
  const conversationSelector =
    'main li:has(time):has(p):has(a[href*="/in/"])';
  const frame = {
    async $(selector) {
      return selector === "main" || selector === conversationSelector ? {} : null;
    },
    async $$eval(selector) {
      assert.equal(selector, conversationSelector);
      return rows;
    },
    async evaluate() {
      return header;
    },
  };

  return {
    visited: null,
    frames: () => [frame],
    async goto(url) {
      this.visited = url;
    },
    async $() {
      return null;
    },
    async url() {
      return this.visited;
    },
  };
}

test("message history uses the matching child frame and semantic rows", async () => {
  const page = messagingPage([
    {
      times: ["Dec 7, 2025", "1:53 AM"],
      profileNames: ["View Ada's profile", "Ada Lovelace"],
      paragraphs: ["Hello"],
    },
    {
      times: ["2:02 AM"],
      profileNames: [],
      paragraphs: ["Follow-up"],
    },
  ]);

  const result = await messagesFromChat(page, null, {
    user: "https://www.linkedin.com/in/ada/",
    count: 20,
  });

  assert.match(page.visited, /\/messaging\/compose\/\?connId=ada$/);
  assert.deepEqual(result, {
    name: "Nithis",
    img: "avatar.png",
    link: page.visited,
    values: [
      { time: "1:53 AM", from: "Ada Lovelace", message: "Hello" },
      { time: "2:02 AM", from: "Ada Lovelace", message: "Follow-up" },
    ],
  });
});

test("message history accepts an existing thread URL without rewriting it", async () => {
  const threadUrl = "https://www.linkedin.com/messaging/thread/example/";
  const page = messagingPage([]);

  const result = await messagesFromChat(page, null, {
    user: threadUrl,
    count: 5,
  });

  assert.equal(page.visited, threadUrl);
  assert.deepEqual(result.values, []);
});

test("message history reports an absent conversation root", async () => {
  const page = {
    frames: () => [],
    async goto() {},
    async $() {
      return null;
    },
  };

  assert.deepEqual(
    await messagesFromChat(page, null, {
      user: "https://www.linkedin.com/in/missing/",
      timeout: 0,
    }),
    { error: "No messages found on the page." }
  );
});

test("message row limiting honors a zero count", () => {
  assert.deepEqual(
    normalizeMessageRows(
      [
        {
          times: ["1:00 PM"],
          profileNames: ["Ada"],
          paragraphs: ["Hello"],
        },
      ],
      0
    ),
    []
  );
});

test("message history propagates unexpected navigation failures", async () => {
  const failure = new Error("navigation failed");
  const page = {
    async goto() {
      throw failure;
    },
  };

  await assert.rejects(
    () =>
      messagesFromChat(page, null, {
        user: "https://www.linkedin.com/messaging/thread/example/",
      }),
    failure
  );
});
