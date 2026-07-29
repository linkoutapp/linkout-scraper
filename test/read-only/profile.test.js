const test = require("node:test");
const assert = require("node:assert/strict");

const scrapeProfileData = require("../../lib/helpers/scrapeProfileData");
const connectionStatus = require("../../lib/linkedin/linkedin.connection.status");
const visit = require("../../lib/linkedin/linkedin.visit.service");

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
    navigationOptions: null,
    frames: () => [],
    async goto(url, options) {
      this.visited = url;
      this.navigationOptions = options;
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
  assert.deepEqual(page.navigationOptions, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
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

test("connection status prefers an explicit connect CTA over unrelated first-degree text", async () => {
  const page = statusPage({
    texts: ["· 1st", "· 2nd", "Connect"],
    labels: ["Invite Siddhart Shibiraj to connect"],
    buttons: ["Connect"],
  });

  assert.equal(
    await connectionStatus(page, null, {
      user: "https://www.linkedin.com/in/siddhartshibiraj/",
    }),
    "Not connected"
  );
});

test("connection status ignores connect buttons outside the profile top card", async () => {
  const page = {
    visited: null,
    navigationOptions: null,
    frames: () => [],
    async goto(url, options) {
      this.visited = url;
      this.navigationOptions = options;
    },
    async $(selector) {
      return selector === "main" ? {} : null;
    },
    async evaluate(callback) {
      const fakeDocument = {
        querySelector(selector) {
          return selector === "main" ? this : null;
        },
        querySelectorAll(selector) {
          if (selector === '[data-view-name="profile-top-card"], section') {
            return [
              {
                querySelector(value) {
                  return value === "h1, h2" ? {} : null;
                },
                querySelectorAll(value) {
                  if (value === "p, span") {
                    return [{ textContent: "· 1st" }];
                  }
                  if (value === "button, a[aria-label], [role='button']") {
                    return [{ textContent: "Message", getAttribute: () => "" }];
                  }
                  return [];
                },
              },
              {
                querySelector(value) {
                  return value === "h1, h2" ? {} : null;
                },
                querySelectorAll(value) {
                  if (value === "button, a[aria-label], [role='button']") {
                    return [{
                      textContent: "Connect",
                      getAttribute: () => "Invite Decoy to connect",
                    }];
                  }
                  return [];
                },
              },
            ];
          }
          return [];
        },
      };
      global.document = fakeDocument;
      try {
        return callback();
      } finally {
        delete global.document;
      }
    },
  };

  assert.equal(
    await connectionStatus(page, null, {
      user: "https://www.linkedin.com/in/friend/",
    }),
    "Connected"
  );
});

test("profile visit reports a structured failure when no member heading exists", async () => {
  const page = profilePage(null);
  let navigationOptions;
  page.goto = async (_url, options) => {
    navigationOptions = options;
  };

  await assert.rejects(
    () => visit(page, null, { url: "https://www.linkedin.com/in/missing/" }),
    (error) => error.code === "PROFILE_NOT_FOUND"
  );
  assert.deepEqual(navigationOptions, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
});

test("profile and connection reads propagate unexpected page failures", async () => {
  const failure = new Error("navigation failed");
  const page = {
    frames: () => [],
    async goto() {
      throw failure;
    },
  };

  await assert.rejects(
    () => visit(page, null, { url: "https://www.linkedin.com/in/ada/" }),
    failure
  );
  await assert.rejects(
    () => connectionStatus(page, null, { user: "https://www.linkedin.com/in/ada/" }),
    failure
  );
});
