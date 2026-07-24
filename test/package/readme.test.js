const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const readme = fs.readFileSync(
  path.resolve(__dirname, "../../README.md"),
  "utf8"
);

test("README uses the official theme-aware Linkout scraper artwork", () => {
  assert.match(readme, /<picture>/);
  assert.match(
    readme,
    /raw\.githubusercontent\.com\/linkoutapp\/brand\/main\/scraper-dark\.svg/
  );
  assert.match(
    readme,
    /raw\.githubusercontent\.com\/linkoutapp\/brand\/main\/scraper-transparent\.svg/
  );
  assert.match(readme, /github\.com\/linkoutapp\/brand/);
});

test("README follows the Linvo-style package introduction", () => {
  assert.match(readme, /^# Linkout LinkedIn Scraper$/m);
  for (const heading of ["Install", "Usage", "Maintainer", "Contributing", "License"]) {
    assert.match(readme, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.match(readme, /npm install linkout-scraper --save/);
  assert.match(readme, /Scrape profiles/);
  assert.doesNotMatch(readme, /Sales Nav/i);
  assert.match(readme, /Connection requests/);
  assert.match(readme, /Send messages/);
  assert.match(readme, /Endorse profiles/);
  assert.match(readme, /Visit profiles/);
  assert.match(readme, /Like posts/);
  assert.match(readme, /connectLocalChrome/);
  assert.match(readme, /remote-debugging-port=9222/);
  assert.match(readme, /Linkout\.tools\.loadCursor\(page, true\)/);
  assert.match(readme, /confirm: true/);
  assert.doesNotMatch(readme, /services\.login/);
  assert.doesNotMatch(readme, /li_at/);
  assert.doesNotMatch(readme, /password/i);
  assert.doesNotMatch(readme, /welcome/i);
  assert.doesNotMatch(readme, /Here you can find/i);
  assert.doesNotMatch(readme, /feel free/i);
  assert.doesNotMatch(readme, /Any contribution/i);
  assert.ok(readme.split("\n").length < 120, "README should remain compact");
});
