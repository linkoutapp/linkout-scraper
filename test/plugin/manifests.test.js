const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

test("Codex and Claude manifests share identity, version, author, and skill", () => {
  const codex = readJson(".codex-plugin/plugin.json");
  const claude = readJson(".claude-plugin/plugin.json");
  assert.equal(codex.name, "linkout-linkedin-read");
  assert.equal(claude.name, codex.name);
  assert.match(codex.version, /^\d+\.\d+\.\d+$/);
  assert.equal(claude.version, codex.version);
  assert.deepEqual(claude.author, codex.author);
  assert.equal(codex.author.name, "Sai-Adarsh");
  assert.equal(codex.author.email, "saiadarshsivakumar@gmail.com");
  assert.equal(codex.skills, "./skills/");
  assert.equal(claude.skills, "./skills/");
  assert.equal(fs.existsSync(path.join(root, "skills/linkedin-read/SKILL.md")), true);
});

test("plugin MCP configs start only the local read-only stdio server", () => {
  const codexManifest = readJson(".codex-plugin/plugin.json");
  const codex = { mcpServers: codexManifest.mcpServers };
  const claude = readJson(".mcp.json");
  const codexServer = codex.mcpServers["linkout-linkedin-read"];
  const claudeServer = claude.mcpServers["linkout-linkedin-read"];

  assert.equal(codexServer.command, "node");
  assert.deepEqual(codexServer.args, ["./bin/linkout-mcp.js"]);
  assert.equal(codexServer.cwd, ".");
  assert.equal(claudeServer.command, "node");
  assert.deepEqual(claudeServer.args, [
    "${CLAUDE_PLUGIN_ROOT}/bin/linkout-mcp.js",
  ]);
  assert.equal(
    claudeServer.env.LINKOUT_CHROME_URL,
    "http://127.0.0.1:9222"
  );

  const serialized = JSON.stringify({ codex, claude });
  assert.doesNotMatch(serialized, /linkedin_(?:send|invite|like|endorse|login)/i);
});

test("manifests point to real relative component paths", () => {
  const codex = readJson(".codex-plugin/plugin.json");
  const claude = readJson(".claude-plugin/plugin.json");
  assert.equal(typeof codex.mcpServers, "object");
  assert.equal(claude.mcpServers, "./.mcp.json");
  for (const relative of [codex.skills, claude.skills, claude.mcpServers]) {
    assert.match(relative, /^\.\//);
    assert.equal(fs.existsSync(path.join(root, relative)), true, relative);
  }
});
