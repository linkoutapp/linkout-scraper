const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const { createMcpServer } = require("../../lib/mcp/server");

test("server registers every definition and writes no diagnostic text to stdout", () => {
  const registrations = [];
  class FakeServer {
    constructor(identity) {
      this.identity = identity;
    }
    registerTool(name, options, handler) {
      registrations.push({ name, options, handler });
    }
  }
  const handlers = new Proxy({}, { get: (_, name) => async () => ({ name }) });
  const z = {
    string: () => ({ url: () => ({ optional: () => ({}) }), optional: () => ({}) }),
    number: () => ({ int: () => ({ min: () => ({ max: () => ({ optional: () => ({}) }) }) }) }),
    object: (shape) => ({ shape }),
  };
  const server = createMcpServer({ McpServer: FakeServer, z, handlers });

  assert.equal(server.identity.name, "linkout-linkedin-read");
  assert.equal(registrations.length, 8);
  const source = fs.readFileSync(require.resolve("../../lib/mcp/server"), "utf8");
  assert.doesNotMatch(source, /console\.log|process\.stdout\.write/);
});
