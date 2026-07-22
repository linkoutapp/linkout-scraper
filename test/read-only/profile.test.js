const test = require("node:test");
const assert = require("node:assert/strict");

const scrapeProfileData = require("../../lib/helpers/scrapeProfileData");
const connectionStatus = require("../../lib/linkedin/linkedin.connection.status");

function textHandle(text) {
  return {
    async evaluate(callback) {
      return callback({ textContent: text });
    },
  };
}

function profilePage(heading) {
  const handles = {
    main: {},
    "main h2": heading == null ? null : textHandle(heading),
  };

  return {
    frames: () => [],
    async $(selector) {
      return handles[selector] || null;
    },
  };
}

function statusPage(signals) {
  return {
    visited: null,
    frames: () => [],
    async goto(url) {
      this.visited = url;
    },
    async $(selector) {
      return selector === "main" ? {} : null;
    },
    async evaluate() {
      return signals;
    },
  };
}

test("profile extraction supports the current level-two heading", async () => {
  const result = await scrapeProfileData(profilePage("  Ada   Lovelace  "));

  assert.deepEqual(result, {
    fullName: "Ada Lovelace",
    firstName: "Ada",
    lastName: "Lovelace",
  });
});

test("profile extraction preserves multi-part family names", async () => {
  const result = await scrapeProfileData(profilePage("Ada Byron Lovelace"));

  assert.deepEqual(result, {
    fullName: "Ada Byron Lovelace",
    firstName: "Ada",
    lastName: "Byron Lovelace",
  });
});

test("profile extraction returns null without a profile heading", async () => {
  assert.equal(await scrapeProfileData(profilePage(null)), null);
});

test("connection status detects a first-degree relationship", async () => {
  const page = statusPage({ texts: ["· 1st"], labels: [], buttons: ["Message"] });

  assert.equal(
    await connectionStatus(page, null, {
      user: "https://www.linkedin.com/in/friend/",
    }),
    "Connected"
  );
});

test("connection status detects a pending invitation", async () => {
  const page = statusPage({ texts: [], labels: ["Pending"], buttons: ["Pending"] });

  assert.equal(
    await connectionStatus(page, null, {
      user: "https://www.linkedin.com/in/pending/",
    }),
    "Pending"
  );
});

test("connection status reports not connected without either signal", async () => {
  const page = statusPage({ texts: ["· 2nd"], labels: [], buttons: ["Connect"] });

  assert.equal(
    await connectionStatus(page, null, {
      user: "https://www.linkedin.com/in/other/",
    }),
    "Not connected"
  );
});
