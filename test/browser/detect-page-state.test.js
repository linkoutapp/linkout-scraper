const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyPageState,
  detectPageState,
} = require("../../lib/browser/detect-page-state");

test("classifyPageState recognizes authenticated, login, and security stops", () => {
  assert.deepEqual(
    classifyPageState({
      url: "https://www.linkedin.com/feed/",
      text: "Home My Network",
      hasAuthenticatedUi: true,
    }),
    { state: "authenticated", stop: false }
  );
  assert.equal(
    classifyPageState({ url: "https://www.linkedin.com/login", text: "Sign in" })
      .state,
    "login"
  );
  assert.equal(
    classifyPageState({
      url: "https://www.linkedin.com/checkpoint/challenge/",
      text: "Security verification",
    }).state,
    "checkpoint"
  );
  assert.equal(
    classifyPageState({ url: "https://www.linkedin.com/feed/", text: "Complete the CAPTCHA" })
      .state,
    "captcha"
  );
  assert.equal(
    classifyPageState({
      url: "https://www.linkedin.com/feed/",
      text: "Your account has been temporarily restricted due to automated activity",
    }).state,
    "automation-warning"
  );
  assert.equal(
    classifyPageState({
      url: "https://www.linkedin.com/feed/",
      text: "Home",
      hasAuthenticatedUi: true,
      unexpectedModal: true,
    }).state,
    "unexpected-modal"
  );
});

test("detectPageState reads a minimal redacted snapshot", async () => {
  const page = {
    url: () => "https://www.linkedin.com/feed/?tracking=secret",
    async evaluate() {
      return {
        text: "Home My Network",
        hasAuthenticatedUi: true,
        unexpectedModal: false,
      };
    },
  };

  assert.deepEqual(await detectPageState(page), {
    state: "authenticated",
    stop: false,
  });
});
