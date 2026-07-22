const profileUrl = Object.freeze({ type: "string", format: "uri" });
const count = Object.freeze({ type: "integer", minimum: 0, maximum: 100, default: 20 });

function tool(name, description, properties, required = []) {
  return Object.freeze({
    name,
    description,
    readOnly: true,
    inputSchema: Object.freeze({
      type: "object",
      properties: Object.freeze(properties),
      required: Object.freeze(required),
      additionalProperties: false,
    }),
  });
}

const TOOL_DEFINITIONS = Object.freeze([
  tool(
    "linkedin_get_profile",
    "Read basic identity information from one LinkedIn profile in visible local Chrome.",
    { url: profileUrl },
    ["url"]
  ),
  tool(
    "linkedin_get_connection_status",
    "Read the current relationship status for one LinkedIn profile.",
    { url: profileUrl },
    ["url"]
  ),
  tool(
    "linkedin_list_connections",
    "List existing LinkedIn connections from the signed-in member's connections page.",
    { count }
  ),
  tool(
    "linkedin_read_message_thread",
    "Read one existing LinkedIn message thread without typing or sending.",
    { threadUrl: profileUrl, profileUrl, count },
    ["threadUrl"]
  ),
  tool(
    "linkedin_list_posts",
    "Read recent posts from one LinkedIn profile.",
    { profileUrl, count },
    ["profileUrl"]
  ),
  tool(
    "linkedin_list_reactions",
    "Read recent reaction activity from one LinkedIn profile.",
    { profileUrl, count },
    ["profileUrl"]
  ),
  tool(
    "linkedin_list_comments",
    "Read recent comment activity from one LinkedIn profile.",
    { profileUrl, count },
    ["profileUrl"]
  ),
  tool(
    "linkedin_list_posts_with_comments",
    "Read one LinkedIn activity item together with currently loaded comments.",
    { activityUrl: profileUrl },
    ["activityUrl"]
  ),
]);

module.exports = { TOOL_DEFINITIONS };
