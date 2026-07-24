const test = require("node:test");
const assert = require("node:assert/strict");

const readOnly = require("../../lib/selectors/read-only");
const actions = require("../../lib/selectors/actions");
const salesNavigator = require("../../lib/selectors/sales-navigator");

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

test("selector groups are non-empty, unique, and semantically prioritized", () => {
  const groups = selectorGroups({
    readOnly,
    actions,
    salesNavigator,
  });

  assert.ok(groups.length > 0);
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
  assert.deepEqual(Object.keys(actions.connect).sort(), [
    "addNote", "menuItem", "moreActions", "note", "primary", "send", "success",
  ]);
  assert.deepEqual(Object.keys(actions.message).sort(), [
    "composeRoot", "editor", "open", "send",
  ]);
  assert.deepEqual(Object.keys(actions.like).sort(), ["button", "success"]);
  assert.deepEqual(Object.keys(actions.endorse), ["button"]);
  assert.deepEqual(Object.keys(salesNavigator).sort(), ["filters", "results"]);
  assert.deepEqual(Object.keys(salesNavigator.results).sort(), ["item", "list"]);
  assert.match(actions.connect.primary[0], /aria-label/);
  assert.match(actions.message.editor[0], /role="textbox"/);
  assert.match(actions.like.button[0], /aria-pressed/);
  assert.match(actions.endorse.button[0], /aria-label/);
  assert.match(salesNavigator.filters.currentTitle[0], /fieldset/);
});
