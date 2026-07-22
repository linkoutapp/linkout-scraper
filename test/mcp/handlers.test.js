const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createHandlers,
  validateLinkedInUrl,
} = require("../../lib/mcp/handlers");

test("validateLinkedInUrl accepts intended LinkedIn pages and strips tracking", () => {
  assert.equal(
    validateLinkedInUrl("https://www.linkedin.com/in/ada/?tracking=secret", ["/in/"]),
    "https://www.linkedin.com/in/ada/"
  );
  assert.throws(
    () => validateLinkedInUrl("https://evil.example/in/ada/", ["/in/"]),
    (error) => error.code === "INVALID_LINKEDIN_URL"
  );
});

test("handlers dispatch read-only services with validated arguments", async () => {
  const calls = [];
  const page = { id: "visible-tab" };
  const services = new Proxy(
    {},
    {
      get(_, name) {
        return async (...args) => {
          calls.push([name, ...args]);
          return { service: name };
        };
      },
    }
  );
  const handlers = createHandlers({ services, pageProvider: async () => page });

  const profile = await handlers.linkedin_get_profile({
    url: "https://www.linkedin.com/in/ada/?tracking=secret",
  });
  assert.equal(profile.structuredContent.result.service, "visit");
  assert.deepEqual(calls[0], [
    "visit",
    page,
    null,
    { url: "https://www.linkedin.com/in/ada/" },
  ]);

  const messages = await handlers.linkedin_read_message_thread({
    threadUrl: "https://www.linkedin.com/messaging/thread/abc/?searchTerm=private",
    profileUrl: "https://www.linkedin.com/in/ada/",
    count: 5,
  });
  assert.equal(messages.structuredContent.result.service, "messagesFromChat");
  assert.equal(JSON.stringify(calls[1]).includes("searchTerm"), false);
});

test("handler failures are structured and do not echo sensitive query values", async () => {
  const handlers = createHandlers({
    services: {},
    pageProvider: async () => ({}),
  });
  const result = await handlers.linkedin_get_profile({
    url: "https://www.linkedin.com/in/ada/?token=private",
  });
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, "SERVICE_UNAVAILABLE");
  assert.equal(JSON.stringify(result).includes("private"), false);
});

test("handlers stop when a challenge appears after service navigation", async () => {
  const page = { stage: "before" };
  const handlers = createHandlers({
    services: {
      async visit(activePage) {
        activePage.stage = "after";
        return { profileData: { fullName: "Hidden" } };
      },
    },
    pageProvider: async () => page,
    detectState: async (activePage) =>
      activePage.stage === "after"
        ? { state: "checkpoint", stop: true }
        : { state: "authenticated", stop: false },
  });

  const result = await handlers.linkedin_get_profile({
    url: "https://www.linkedin.com/in/ada/",
  });

  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, "PAGE_STATE_STOP");
  assert.equal(JSON.stringify(result).includes("Hidden"), false);
});
