const test = require("node:test");
const assert = require("node:assert/strict");

const acceptedConnections = require(
  "../../lib/linkedin/linkedin.accepted.connection.request.service"
);

function connectionsPage(rows) {
  const currentSelector = 'main a[href*="/in/"]';

  return {
    visited: null,
    queriedSelector: null,
    frames: () => [],
    async goto(url) {
      this.visited = url;
    },
    async $(selector) {
      return selector === "main" || selector === currentSelector ? {} : null;
    },
    async $$eval(selector) {
      this.queriedSelector = selector;
      return rows;
    },
  };
}

test("connections use current profile links and remove duplicates", async () => {
  const page = connectionsPage([
    { href: "/in/ada/", name: "" },
    { href: "https://www.linkedin.com/in/ada/?trk=connections", name: "Ada Lovelace" },
    { href: "/in/grace/", name: "Grace Hopper" },
  ]);

  const result = await acceptedConnections(page);

  assert.equal(page.queriedSelector, 'main a[href*="/in/"]');
  assert.deepEqual(result, [
    { name: "Ada Lovelace", url: "https://www.linkedin.com/in/ada/" },
    { name: "Grace Hopper", url: "https://www.linkedin.com/in/grace/" },
  ]);
});

test("connections discard non-profile and unnamed rows", async () => {
  const page = connectionsPage([
    { href: "https://www.linkedin.com/company/example/", name: "Example" },
    { href: "/in/unnamed/", name: "" },
    { href: "javascript:void(0)", name: "Bad" },
  ]);

  assert.deepEqual(await acceptedConnections(page), []);
});

test("connections return an empty list when the page root is absent", async () => {
  const page = {
    frames: () => [],
    async goto() {},
    async $() {
      return null;
    },
  };

  assert.deepEqual(await acceptedConnections(page), []);
});
