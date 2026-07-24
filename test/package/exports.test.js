const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

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
    "visit",
  ]);
  for (const name of Object.keys(linkout.services)) {
    assert.equal(typeof linkout.services[name], "function", name);
  }
  assert.equal(typeof linkout.tools.loadCursor, "function");
});

test("removed legacy automation is absent from the 2026 runtime", () => {
  const linkout = require("../../lib/linkedin.service");

  assert.equal(Object.hasOwn(linkout.services, "login"), false);
  assert.equal(Object.hasOwn(linkout.services, "loginWithEmail"), false);
  assert.equal(Object.hasOwn(linkout.services, "send2FA"), false);
  assert.equal(Object.hasOwn(linkout.tools, "setUserAgent"), false);

  for (const file of [
    "config/device.macos.json",
    "lib/enums/linkedin.errors.js",
    "lib/helpers/scrapeFeedData.js",
    "lib/helpers/setUserAgent.js",
    "lib/helpers/show.mouse.js",
    "lib/helpers/typeMessage.js",
    "lib/linkedin/linkedin.common.service.js",
    "lib/linkedin/linkedin.send2FA.js",
    "lib/linkedin/linkedin.sales.nav.scraper.js",
    "lib/selectors/auth.js",
    "lib/selectors/index.js",
    "lib/selectors/sales-navigator.js",
  ]) {
    assert.equal(fs.existsSync(path.join(root, file)), false, file);
  }
  assert.equal(Object.hasOwn(linkout.services, "salesNavScraper"), false);
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
