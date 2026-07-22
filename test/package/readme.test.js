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

test("README presents a minimal branded developer journey", () => {
  for (const heading of ["Quick start", "What it includes", "Safety", "Development"]) {
    assert.match(readme, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.match(readme, /img\.shields\.io\/badge\/Node\.js-22%2B/);
  assert.match(readme, /img\.shields\.io\/badge\/platform-macOS/);
  assert.match(readme, /npm start:mcp/);
  assert.match(readme, /linkedin_get_profile/);
  assert.match(readme, /confirm: true/);
  assert.ok(readme.split("\n").length < 150, "README should remain compact");
});
