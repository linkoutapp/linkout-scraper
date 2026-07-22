#!/usr/bin/env node

require("../lib/mcp/server").startServer().catch((error) => {
  process.stderr.write(`Linkout MCP failed: ${error.code || "START_FAILED"}\n`);
  process.exitCode = 1;
});
