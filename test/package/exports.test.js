const test = require("node:test");
const assert = require("node:assert/strict");

test("CommonJS entry exports every supported service and tool name", () => {
  const linkout = require("../../lib/linkedin.service");
  assert.deepEqual(Object.keys(linkout.services).sort(), [
    "acceptedConnections",
    "comments",
    "connect",
    "connectionStatus",
    "endorse",
    "like",
    "message",
    "messagesFromChat",
    "posts",
    "postsWithComments",
    "reactions",
    "salesNavScraper",
    "send2FA",
    "visit",
  ]);
  for (const name of Object.keys(linkout.services)) {
    assert.equal(typeof linkout.services[name], "function", name);
  }
  assert.equal(typeof linkout.tools.loadCursor, "function");
  assert.equal(typeof linkout.tools.setUserAgent, "function");
});

test("removed login automation is not exposed by the 2026 runtime", () => {
  const linkout = require("../../lib/linkedin.service");
  const selectors = require("../../lib/selectors");

  assert.equal(Object.hasOwn(linkout.services, "login"), false);
  assert.equal(Object.hasOwn(linkout.services, "loginWithEmail"), false);
  assert.equal(Object.hasOwn(selectors.serviceWorkflows, "login"), false);
  assert.equal(Object.hasOwn(selectors.serviceWorkflows, "loginWithEmail"), false);
});

test("CommonJS entry exports the safe 2026 infrastructure without connecting", () => {
  const linkout = require("../../lib/linkedin.service");
  for (const name of [
    "connectLocalChrome",
    "createActionPolicy",
    "detectPageState",
    "resolveSelector",
  ]) {
    assert.equal(typeof linkout.tools[name], "function", name);
  }
});
