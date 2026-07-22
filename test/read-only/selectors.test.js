const test = require("node:test");
const assert = require("node:assert/strict");

const selectors = require("../../lib/selectors/read-only");

test("every logical selector has ordered non-empty candidates", () => {
  for (const [group, entries] of Object.entries(selectors)) {
    for (const [name, candidates] of Object.entries(entries)) {
      assert.ok(Array.isArray(candidates), `${group}.${name}`);
      assert.ok(candidates.length > 0, `${group}.${name}`);
      assert.equal(
        new Set(candidates).size,
        candidates.length,
        `${group}.${name} contains duplicate candidates`
      );
      candidates.forEach((candidate) =>
        assert.equal(typeof candidate, "string", `${group}.${name}`)
      );
    }
  }
});

test("current semantic candidates precede legacy class fallbacks", () => {
  assert.equal(selectors.profile.root[0], "main");
  assert.match(selectors.connections.profileLinks[0], /href/);
  assert.match(selectors.messaging.conversation[0], /:has\(/);
  assert.match(selectors.activity.postLinks[0], /feed\/update/);
});
