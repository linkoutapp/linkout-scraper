const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const smokePath = path.join(__dirname, "read-only.smoke.js");

test("live selector smoke harness cannot perform browser input or mutations", () => {
  const source = fs.readFileSync(smokePath, "utf8");

  const forbidden = [
    /\.click\s*\(/,
    /\.type\s*\(/,
    /\.press\s*\(/,
    /\.keyboard\b/,
    /\.mouse\b/,
    /\.connect\s*\(/,
    /\.message\s*\(/,
    /\.like\s*\(/,
    /\.endorse\s*\(/,
    /\.salesNavScraper\s*\(/,
    /\.login(?:WithEmail)?\s*\(/,
    /\.send2FA\s*\(/,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});

test("live selector smoke harness exercises every read-only service", () => {
  const source = fs.readFileSync(smokePath, "utf8");
  const services = [
    "visit",
    "connectionStatus",
    "acceptedConnections",
    "messagesFromChat",
    "posts",
    "reactions",
    "comments",
    "postsWithComments",
  ];

  for (const service of services) {
    assert.match(source, new RegExp(`Linkout\\.services\\.${service}\\s*\\(`));
  }
});
