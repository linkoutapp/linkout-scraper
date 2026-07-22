const { connectLocalChrome } = require("../browser/connect-local-chrome");
const LinkoutError = require("../errors/linkout-error");
const { services } = require("../linkedin.service");
const { createHandlers } = require("./handlers");
const { TOOL_DEFINITIONS } = require("./tool-definitions");

function zodProperty(z, property, required) {
  let schema;
  if (property.type === "integer") {
    schema = z.number().int().min(property.minimum).max(property.maximum);
  } else {
    schema = z.string();
    if (property.format === "uri") schema = schema.url();
  }
  return required ? schema : schema.optional();
}

function inputShape(z, definition) {
  const required = new Set(definition.inputSchema.required || []);
  return Object.fromEntries(
    Object.entries(definition.inputSchema.properties || {}).map(([name, property]) => [
      name,
      zodProperty(z, property, required.has(name)),
    ])
  );
}

function createMcpServer({ McpServer, z, handlers }) {
  const server = new McpServer({ name: "linkout-linkedin-read", version: "2.0.0" });
  for (const definition of TOOL_DEFINITIONS) {
    server.registerTool(
      definition.name,
      {
        description: definition.description,
        inputSchema: inputShape(z, definition),
        annotations: { readOnlyHint: true, destructiveHint: false },
      },
      handlers[definition.name]
    );
  }
  return server;
}

async function existingLinkedInPage(browser) {
  const pages = await browser.pages();
  const page = pages.find((candidate) => {
    try {
      return new URL(candidate.url()).hostname === "www.linkedin.com";
    } catch (_) {
      return false;
    }
  });
  if (!page) {
    throw new LinkoutError(
      "LINKEDIN_TAB_REQUIRED",
      "Open LinkedIn in the visible Chrome session before using the plugin"
    );
  }
  return page;
}

async function startServer({ browserURL = process.env.LINKOUT_CHROME_URL } = {}) {
  const [{ McpServer }, { StdioServerTransport }, zod] = await Promise.all([
    import("@modelcontextprotocol/sdk/server/mcp.js"),
    import("@modelcontextprotocol/sdk/server/stdio.js"),
    import("zod"),
  ]);
  const z = zod.z || zod.default;
  const browser = await connectLocalChrome({
    browserURL: browserURL || "http://127.0.0.1:9222",
  });
  const handlers = createHandlers({
    services,
    pageProvider: () => existingLinkedInPage(browser),
  });
  const server = createMcpServer({ McpServer, z, handlers });
  await server.connect(new StdioServerTransport());
  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    process.stderr.write(`Linkout MCP failed: ${error.code || "START_FAILED"}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  createMcpServer,
  existingLinkedInPage,
  inputShape,
  startServer,
};
