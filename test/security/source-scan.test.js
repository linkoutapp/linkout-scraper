const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

function javascriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? javascriptFiles(target)
      : entry.name.endsWith(".js")
        ? [target]
        : [];
  });
}

test("2026 runtime has no stealth, fingerprint spoofing, or infinite wait hooks", () => {
  const source = javascriptFiles(path.join(root, "lib"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  for (const pattern of [
    /puppeteer-extra/i,
    /plugin-stealth/i,
    /robotjs/i,
    /\.setUserAgent\s*\(/,
    /waitForSelectorInfinite/,
    /navigator\.(?:webdriver|platform|languages)/,
    /HTMLCanvasElement|WebGLRenderingContext/,
    /while\s*\(\s*true\s*\)/,
  ]) {
    assert.doesNotMatch(source, pattern);
  }
});

test("package targets maintained direct-runtime dependencies", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.version, "2.0.0");
  assert.equal(pkg.main, "lib/linkedin.service.js");
  assert.equal(pkg.engines.node, ">=22");
  assert.equal(pkg.scripts.test, "node --test");
  assert.equal(pkg.bin["linkout-mcp"], "bin/linkout-mcp.js");
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
    "@modelcontextprotocol/sdk",
    "ghost-cursor",
    "puppeteer-core",
    "zod",
  ]);
  assert.deepEqual(pkg.devDependencies || {}, {});
});
