const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const skillPath = path.resolve(__dirname, "../../skills/linkedin-read/SKILL.md");
const metadataPath = path.resolve(
  __dirname,
  "../../skills/linkedin-read/agents/openai.yaml"
);

test("shared skill has trigger-only metadata and validated UI metadata", () => {
  const skill = fs.readFileSync(skillPath, "utf8");
  assert.match(skill, /^---\nname: linkedin-read\ndescription: Use when /);
  assert.match(skill, /\n---\n/);
  assert.equal(fs.existsSync(metadataPath), true);
  const metadata = fs.readFileSync(metadataPath, "utf8");
  assert.match(metadata, /display_name: ["']?LinkedIn Read["']?/);
  assert.match(metadata, /short_description:/);
  assert.match(metadata, /default_prompt:/);
});

test("shared skill enforces visible local read-only operation and stop conditions", () => {
  const skill = fs.readFileSync(skillPath, "utf8");
  for (const phrase of [
    "visible local Chrome",
    "already signed in",
    "read-only",
    "minimum data",
    "checkpoint",
    "CAPTCHA",
    "automation warning",
    "does not guarantee",
  ]) {
    assert.match(skill, new RegExp(phrase, "i"), phrase);
  }
  for (const tool of [
    "linkedin_get_profile",
    "linkedin_get_connection_status",
    "linkedin_list_connections",
    "linkedin_read_message_thread",
    "linkedin_list_posts",
    "linkedin_list_reactions",
    "linkedin_list_comments",
    "linkedin_list_posts_with_comments",
  ]) {
    assert.match(skill, new RegExp(`\\b${tool}\\b`), tool);
  }
});
