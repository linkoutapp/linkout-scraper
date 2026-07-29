const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_NAVIGATION_TIMEOUT,
  navigateLinkedIn,
  navigationTimeout,
} = require("../../lib/helpers/navigate-linkedin");

test("LinkedIn navigation defaults to DOMContentLoaded with a bounded timeout", async () => {
  const calls = [];
  const page = {
    async goto(url, options) {
      calls.push([url, options]);
    },
  };

  await navigateLinkedIn(page, "https://www.linkedin.com/in/ada/");

  assert.deepEqual(calls, [
    [
      "https://www.linkedin.com/in/ada/",
      { waitUntil: "domcontentloaded", timeout: DEFAULT_NAVIGATION_TIMEOUT },
    ],
  ]);
});

test("LinkedIn navigation accepts explicit navigation timeout only", () => {
  assert.equal(navigationTimeout({ navigationTimeout: 30000 }), 30000);
  assert.equal(navigationTimeout({ timeout: 1 }), DEFAULT_NAVIGATION_TIMEOUT);
});
