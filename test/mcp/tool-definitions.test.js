const test = require("node:test");
const assert = require("node:assert/strict");

const { TOOL_DEFINITIONS } = require("../../lib/mcp/tool-definitions");

test("MCP exposes exactly eight read-only LinkedIn tools", () => {
  assert.deepEqual(
    TOOL_DEFINITIONS.map((tool) => tool.name),
    [
      "linkedin_get_profile",
      "linkedin_get_connection_status",
      "linkedin_list_connections",
      "linkedin_read_message_thread",
      "linkedin_list_posts",
      "linkedin_list_reactions",
      "linkedin_list_comments",
      "linkedin_list_posts_with_comments",
    ]
  );
  for (const tool of TOOL_DEFINITIONS) {
    assert.equal(tool.readOnly, true, tool.name);
    assert.ok(tool.description, tool.name);
    assert.equal(tool.inputSchema.type, "object", tool.name);
    assert.doesNotMatch(
      tool.name,
      /^linkedin_(?:send|connect|invite|like|endorse|login|submit)/i
    );
  }
});

test("URL and count schemas are bounded", () => {
  for (const tool of TOOL_DEFINITIONS) {
    for (const property of Object.values(tool.inputSchema.properties || {})) {
      if (property.format === "uri") assert.equal(property.type, "string");
      if (property.type === "integer") {
        assert.ok(property.minimum >= 0);
        assert.ok(property.maximum <= 100);
      }
    }
  }
});
