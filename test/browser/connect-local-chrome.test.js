const test = require("node:test");
const assert = require("node:assert/strict");

const {
  connectLocalChrome,
  validateDevtoolsEndpoint,
} = require("../../lib/browser/connect-local-chrome");

test("validateDevtoolsEndpoint accepts loopback HTTP only by default", () => {
  assert.equal(
    validateDevtoolsEndpoint("http://127.0.0.1:9222").hostname,
    "127.0.0.1"
  );
  assert.equal(
    validateDevtoolsEndpoint("http://localhost:9222").hostname,
    "localhost"
  );
  assert.throws(
    () => validateDevtoolsEndpoint("http://192.0.2.10:9222"),
    /loopback/i
  );
  assert.throws(
    () => validateDevtoolsEndpoint("https://example.com"),
    /loopback/i
  );
});

test("connectLocalChrome connects to visible existing Chrome without launching", async () => {
  const browser = { id: "existing-browser" };
  const calls = [];
  const puppeteer = {
    async connect(options) {
      calls.push(["connect", options]);
      return browser;
    },
    async launch() {
      calls.push(["launch"]);
      throw new Error("must not launch");
    },
  };

  const result = await connectLocalChrome({
    browserURL: "http://127.0.0.1:9222",
    puppeteer,
    platform: "darwin",
  });

  assert.equal(result, browser);
  assert.deepEqual(calls, [
    [
      "connect",
      {
        browserURL: "http://127.0.0.1:9222/",
        defaultViewport: null,
      },
    ],
  ]);
});

test("connectLocalChrome rejects unsupported devices and never accepts fingerprint options", async () => {
  await assert.rejects(
    connectLocalChrome({
      browserURL: "http://127.0.0.1:9222",
      puppeteer: { connect: async () => ({}) },
      platform: "linux",
    }),
    /macOS/i
  );

  await assert.rejects(
    connectLocalChrome({
      browserURL: "http://127.0.0.1:9222",
      puppeteer: { connect: async () => ({}) },
      platform: "darwin",
      userAgent: "spoofed",
    }),
    /fingerprint|override/i
  );
});
