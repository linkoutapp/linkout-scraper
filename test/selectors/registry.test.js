const test = require("node:test");
const assert = require("node:assert/strict");

const linkout = require("../../lib/linkedin.service");
const registry = require("../../lib/selectors");

function selectorGroups(value, path = []) {
  const groups = [];
  for (const [name, entry] of Object.entries(value)) {
    const nextPath = [...path, name];
    if (Array.isArray(entry)) groups.push([nextPath.join("."), entry]);
    else if (entry && typeof entry === "object") {
      groups.push(...selectorGroups(entry, nextPath));
    }
  }
  return groups;
}

test("every exported service maps to an inventoried selector workflow", () => {
  assert.deepEqual(
    Object.keys(registry.serviceWorkflows).sort(),
    Object.keys(linkout.services).sort()
  );

  for (const [service, path] of Object.entries(registry.serviceWorkflows)) {
    const group = path.split(".").reduce((value, key) => value && value[key], registry);
    assert.ok(group, `${service} maps to missing selector group ${path}`);
  }
});

test("selector groups are non-empty, unique, and semantically prioritized", () => {
  const groups = selectorGroups({
    readOnly: registry.readOnly,
    auth: registry.auth,
    actions: registry.actions,
    salesNavigator: registry.salesNavigator,
  });

  assert.ok(groups.length >= 25);
  for (const [name, candidates] of groups) {
    assert.ok(candidates.length > 0, name);
    assert.equal(new Set(candidates).size, candidates.length, name);
    candidates.forEach((candidate) => {
      assert.equal(typeof candidate, "string", name);
      assert.ok(candidate.trim(), name);
    });

    const primary = candidates[0];
    assert.doesNotMatch(primary, /#ember\d+/i, `${name} uses generated Ember ID`);
    assert.doesNotMatch(primary, /:nth-child\(/i, `${name} uses positional primary`);
    assert.doesNotMatch(primary, />\s*div\s*>\s*div\s*>/i, `${name} uses deep primary`);
  }
});

test("current semantic action selectors precede legacy fallbacks", () => {
  assert.equal(registry.auth.login.username[0], 'input[name="session_key"]');
  assert.match(registry.actions.connect.primary[0], /aria-label/);
  assert.match(registry.actions.message.editor[0], /role="textbox"/);
  assert.match(registry.actions.like.button[0], /aria-pressed/);
  assert.match(registry.actions.endorse.button[0], /aria-label/);
  assert.match(registry.salesNavigator.filters.currentTitle[0], /fieldset/);
});
