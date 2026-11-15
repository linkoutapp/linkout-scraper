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

test("README documents supported installation and valid Node examples", () => {
  assert.match(readme, /^# Linkout LinkedIn Scraper$/m);
  for (const heading of ["Install", "Usage", "Maintainer", "Contributing", "License"]) {
    assert.match(readme, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.match(readme, /npm install linkout-scraper --save/);
  assert.match(readme, /remote-debugging-port=9222/);
  assert.doesNotMatch(readme, /services\.login/);
  const examples = [...readme.matchAll(/```js\n([\s\S]*?)```/g)];
  assert.ok(examples.length > 0, "README must include a JavaScript usage example");
  for (const [, source] of examples) {
    assert.doesNotThrow(() => new (require("node:vm").Script)(source));
  }
});
