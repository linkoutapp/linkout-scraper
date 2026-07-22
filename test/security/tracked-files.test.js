const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");

function trackedFiles() {
  return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

test("credentials, legacy executable examples, and local browser state are not tracked", () => {
  const tracked = trackedFiles();
  for (const forbidden of [
    ".env",
    "__tests__/test.example.js",
    "__tests__/test.sales.nav.scraper.js",
    "__tests__/test.server.js",
  ]) {
    assert.equal(tracked.includes(forbidden), false, forbidden);
  }
  assert.equal(fs.existsSync(path.join(root, ".env.example")), true);
  assert.equal(tracked.some((file) => file.startsWith("dist/")), false);
  assert.equal(
    tracked.some((file) => /(?:chrome-profile|actions\.jsonl|\.linkout\/)/i.test(file)),
    false
  );
});

test("tracked runtime and documentation contain no credential values", () => {
  const candidates = trackedFiles().filter((file) =>
    /\.(?:js|json|md|ya?ml|env|example)$/.test(file)
  );
  for (const file of candidates) {
    const value = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(value, /li_at\s*[:=]\s*["'][A-Za-z0-9_-]{20,}/i, file);
    assert.doesNotMatch(value, /password\s*[:=]\s*["'][^"']{8,}/i, file);
  }
});

test("gitignore protects local credentials, ledgers, and Chrome profiles", () => {
  const ignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  for (const entry of [".env", ".linkout/", "chrome-profile/"]) {
    assert.match(ignore, new RegExp(`^${entry.replace(".", "\\.")}$`, "m"));
  }
});
