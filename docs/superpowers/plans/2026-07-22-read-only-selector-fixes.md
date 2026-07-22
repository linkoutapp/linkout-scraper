# Read-Only Selector Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore regular LinkedIn read-only scraping on the authenticated 2026 desktop UI while leaving every account-mutating action unchanged.

**Architecture:** Add a small frame-aware query layer with ordered current/legacy selector fallbacks, then migrate only read-only services to it. Use semantic containers and stable link patterns for extraction, cover behavior with Node's built-in test runner and page/frame mocks, and retain the existing CommonJS public API.

**Tech Stack:** CommonJS JavaScript, Node.js built-in `node:test`, Puppeteer-compatible page/frame interfaces, authenticated macOS Chrome live smoke checks at a 1440×900 English desktop viewport.

---

## Scope

Included services are profile/visit scraping, connection status, accepted-connections listing, message-history reading, and activity/posts/reactions/comments reading. Login remains unchanged. Sales Navigator and the mutating `connect`, `message`, `like`, `endorse`, and `send2FA` implementations are excluded.

## File Structure

- Create `lib/helpers/find-page-context.js`: locate the main document or child frame containing one of several selector candidates.
- Create `lib/selectors/read-only.js`: central ordered selector candidates for regular LinkedIn read-only workflows.
- Modify `lib/helpers/scrapeProfileData.js`: extract profile identity using current semantic markup with legacy fallback.
- Modify `lib/linkedin/linkedin.connection.status.js`: derive state without positional selectors.
- Modify `lib/linkedin/linkedin.accepted.connection.request.service.js`: extract unique profile links from current connection results.
- Modify `lib/linkedin/linkedin.messages.from.chat.service.js`: read current thread markup through a frame-aware context.
- Modify `lib/linkedin/linkedin.posts.js`, `linkedin.reactions.js`, `linkedin.comments.js`, and `linkedin.posts.with.comments.js`: find activity cards and post links without opening share menus.
- Modify `lib/linkedin/linkedin.common.service.js`: expose internal helpers only where existing service composition needs them.
- Create `test/read-only/*.test.js`: deterministic unit tests with page/frame mocks.
- Modify `package.json`: run the built-in test suite.
- Regenerate matching `dist/` files with the existing build command after source tests pass.

### Task 1: Frame-Aware Selector Resolution

**Files:**
- Create: `lib/helpers/find-page-context.js`
- Create: `test/read-only/find-page-context.test.js`
- Modify: `package.json`

- [ ] **Step 1: Add the failing context-resolution tests**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  findPageContext,
  findFirstSelector,
} = require("../../lib/helpers/find-page-context");

function context(matches = {}) {
  return {
    async $(selector) {
      return matches[selector] || null;
    },
  };
}

test("findPageContext checks the page before child frames", async () => {
  const page = Object.assign(context({ main: { id: "page" } }), {
    frames: () => [context({ main: { id: "frame" } })],
  });
  assert.equal(await findPageContext(page, ["main"]), page);
});

test("findPageContext finds a matching child frame", async () => {
  const frame = context({ main: { id: "frame" } });
  const page = Object.assign(context(), { frames: () => [page, frame] });
  assert.equal(await findPageContext(page, ["main"]), frame);
});

test("findFirstSelector returns candidates in priority order", async () => {
  const target = context({ ".legacy": {}, '[role="main"]': {} });
  assert.equal(
    await findFirstSelector(target, ['[role="main"]', ".legacy"]),
    '[role="main"]'
  );
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test test/read-only/find-page-context.test.js`  
Expected: FAIL because `lib/helpers/find-page-context.js` does not exist.

- [ ] **Step 3: Implement the minimal frame-aware helper**

```js
async function findFirstSelector(context, selectors) {
  for (const selector of selectors) {
    if (await context.$(selector)) return selector;
  }
  return null;
}

async function findPageContext(page, selectors) {
  const contexts = [page, ...(typeof page.frames === "function" ? page.frames() : [])];
  for (const context of [...new Set(contexts)]) {
    if (await findFirstSelector(context, selectors)) return context;
  }
  return null;
}

module.exports = { findFirstSelector, findPageContext };
```

Set the package test script to `node --test test/read-only/*.test.js`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- --test-name-pattern="findPageContext|findFirstSelector"`  
Expected: three passing tests.

- [ ] **Step 5: Commit the helper**

```bash
git add package.json lib/helpers/find-page-context.js test/read-only/find-page-context.test.js
git commit -m "test: add frame-aware selector resolution"
```

### Task 2: Central Read-Only Selector Registry

**Files:**
- Create: `lib/selectors/read-only.js`
- Create: `test/read-only/selectors.test.js`

- [ ] **Step 1: Add failing registry integrity tests**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const selectors = require("../../lib/selectors/read-only");

test("every logical selector has ordered non-empty candidates", () => {
  for (const [group, entries] of Object.entries(selectors)) {
    for (const [name, candidates] of Object.entries(entries)) {
      assert.ok(Array.isArray(candidates), `${group}.${name}`);
      assert.ok(candidates.length > 0, `${group}.${name}`);
      assert.equal(new Set(candidates).size, candidates.length, `${group}.${name}`);
      candidates.forEach((candidate) => assert.equal(typeof candidate, "string"));
    }
  }
});
```

- [ ] **Step 2: Verify the registry test fails**

Run: `node --test test/read-only/selectors.test.js`  
Expected: FAIL because the selector registry does not exist.

- [ ] **Step 3: Add current semantic candidates followed by legacy fallbacks**

```js
module.exports = Object.freeze({
  profile: {
    root: ['main', '[role="main"]', '#profile-content'],
    name: ['main h2', '[role="main"] h2', 'h1'],
    degree: ['main [class*="distance"]', '[aria-label*="degree connection"]', '.dist-value'],
    pending: ['button[aria-label*="Pending"]', '[aria-label*="Pending"]'],
  },
  connections: {
    root: ['main', '[role="main"]'],
    profileLinks: ['main a[href*="/in/"]', '[role="main"] a[href*="/in/"]', 'ul .mn-connection-card a'],
  },
  messaging: {
    root: ['main', '[role="main"]'],
    conversation: ['main li:has(time):has(p)', '[role="main"] li:has(time):has(p)', '.msg-s-message-list__event'],
    profileLink: ['a[href*="/in/"]', '[data-control-name="view_profile"]', '.msg-s-message-group__profile-link'],
    message: ['p', '[data-event-urn] p'],
    time: ['time'],
  },
  activity: {
    root: ['.pv-recent-activity-detail__core-rail', 'main', '[role="main"]'],
    postLinks: ['a[href*="/feed/update/"]', 'a[href*="/posts/"]'],
    actor: ['a[href*="/in/"]', '.update-components-actor__title'],
    time: ['time', '.update-components-actor__sub-description-link'],
    text: ['p', '.update-components-text'],
  },
});
```

- [ ] **Step 4: Run registry tests**

Run: `node --test test/read-only/selectors.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit the selector registry**

```bash
git add lib/selectors/read-only.js test/read-only/selectors.test.js
git commit -m "refactor: centralize read-only selectors"
```

### Task 3: Profile Visit and Connection Status

**Files:**
- Modify: `lib/helpers/scrapeProfileData.js`
- Modify: `lib/linkedin/linkedin.connection.status.js`
- Create: `test/read-only/profile.test.js`

- [ ] **Step 1: Add failing extraction tests**

Create a mock context whose `evaluate` callback is represented by fixture results and assert that `scrapeProfileData()` returns `{ fullName, firstName, lastName }` from a current `main h2` candidate. Add cases for a one-word name and missing heading. Add connection-status cases for `1st`, `Pending`, and neither signal.

```js
test("profile extraction supports current heading structure", async () => {
  const result = await scrapeProfileData(fakePage({ heading: "Ada Lovelace" }));
  assert.deepEqual(result, {
    fullName: "Ada Lovelace",
    firstName: "Ada",
    lastName: "Lovelace",
  });
});
```

- [ ] **Step 2: Verify the focused tests fail**

Run: `node --test test/read-only/profile.test.js`  
Expected: FAIL because the current implementation only queries `h1` and status uses a positional card selector.

- [ ] **Step 3: Implement selector-fallback extraction**

Use `findPageContext()` and `selectors.profile`. Return `null` when no non-empty heading exists. Split the normalized name on whitespace, preserving all trailing words in `lastName`. Derive status in order: explicit `1st` relationship signal, pending action label, then `Not connected`. Do not click any button.

```js
const fullName = String(await handle.evaluate((node) => node.textContent || ""))
  .trim()
  .replace(/\s+/g, " ");
const [firstName = "", ...rest] = fullName.split(" ");
return { fullName, firstName, lastName: rest.join(" ") };
```

- [ ] **Step 4: Run profile/status tests**

Run: `node --test test/read-only/profile.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit profile fixes**

```bash
git add lib/helpers/scrapeProfileData.js lib/linkedin/linkedin.connection.status.js test/read-only/profile.test.js
git commit -m "fix: restore read-only profile selectors"
```

### Task 4: Accepted Connections Listing

**Files:**
- Modify: `lib/linkedin/linkedin.accepted.connection.request.service.js`
- Create: `test/read-only/connections.test.js`

- [ ] **Step 1: Add failing tests for semantic profile-link extraction**

Test URL normalization, duplicate removal, empty labels, and exclusion of navigation/self links. The fixture result should contain repeated `/in/example/` anchors and verify one `{ name, url }` result.

- [ ] **Step 2: Verify tests fail**

Run: `node --test test/read-only/connections.test.js`  
Expected: FAIL because only `.mn-connection-card` markup is supported.

- [ ] **Step 3: Implement current connection extraction**

Resolve the main context, evaluate all profile-link candidates in one browser call, normalize URLs with `new URL(href, "https://www.linkedin.com")`, derive names from `aria-label`, visible text, or a descendant image `alt`, and deduplicate by pathname. Retain the legacy card path only as the final fallback.

- [ ] **Step 4: Run connection tests**

Run: `node --test test/read-only/connections.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit connection fixes**

```bash
git add lib/linkedin/linkedin.accepted.connection.request.service.js test/read-only/connections.test.js
git commit -m "fix: restore connection list scraping"
```

### Task 5: Read Message History Without Sending

**Files:**
- Modify: `lib/linkedin/linkedin.messages.from.chat.service.js`
- Create: `test/read-only/messages.test.js`

- [ ] **Step 1: Add failing message-history tests**

Test a semantic list item containing a profile link, two `time` elements, and a paragraph. Verify `{ time, from, message }`, frame selection, empty-conversation handling, and that no mock `click`, `type`, `press`, or `send` method is called.

- [ ] **Step 2: Verify tests fail**

Run: `node --test test/read-only/messages.test.js`  
Expected: FAIL because the service only supports legacy `.msg-*` classes.

- [ ] **Step 3: Implement frame-aware semantic extraction**

After navigating to the existing compose URL, find the document/frame containing the messaging root. Extract bounded message rows in one `$$eval` call. For each row, use the last `time` as the timestamp, a scoped `/in/` link as sender, and the first non-empty paragraph as message. Preserve `{ name, img, link, values }` and return `{ error: "No messages found on the page." }` only when no conversation container exists.

- [ ] **Step 4: Run message tests**

Run: `node --test test/read-only/messages.test.js`  
Expected: PASS with no mutating mock calls.

- [ ] **Step 5: Commit message-history fixes**

```bash
git add lib/linkedin/linkedin.messages.from.chat.service.js test/read-only/messages.test.js
git commit -m "fix: restore read-only message history"
```

### Task 6: Activity, Posts, Reactions, and Comments

**Files:**
- Modify: `lib/linkedin/linkedin.posts.js`
- Modify: `lib/linkedin/linkedin.reactions.js`
- Modify: `lib/linkedin/linkedin.comments.js`
- Modify: `lib/linkedin/linkedin.posts.with.comments.js`
- Create: `lib/helpers/scrape-activity.js`
- Create: `test/read-only/activity.test.js`

- [ ] **Step 1: Add failing activity extraction tests**

Use fixture results containing semantic post links, actor links, `time`, post text, and comment rows. Verify URL deduplication, bounded `count`, reaction label normalization, comment extraction, and that no share-menu or reaction button is clicked.

- [ ] **Step 2: Verify tests fail**

Run: `node --test test/read-only/activity.test.js`  
Expected: FAIL because activity URL discovery depends on opening each legacy share menu.

- [ ] **Step 3: Implement a shared read-only activity extractor**

Create `scrapeActivity(context, { count, mode })` that finds activity cards from semantic post links, scopes actor/time/text/comment data to each closest article or list item, normalizes absolute URLs, deduplicates by URL, and returns at most `count` items. It must not click, react, open menus, or send data.

- [ ] **Step 4: Adapt exported services without changing signatures**

Keep `posts(page, cdp, data)`, `reactions(page, cdp, data)`, `comments(page, cdp, data)`, and `postsWithComments(page, cdp, data)`. Replace share-menu discovery with `scrapeActivity`; retain their current return shapes and return empty arrays instead of `undefined` when no activity exists.

- [ ] **Step 5: Run activity tests**

Run: `node --test test/read-only/activity.test.js`  
Expected: PASS with no mutating mock calls.

- [ ] **Step 6: Commit activity fixes**

```bash
git add lib/helpers/scrape-activity.js lib/linkedin/linkedin.posts.js lib/linkedin/linkedin.reactions.js lib/linkedin/linkedin.comments.js lib/linkedin/linkedin.posts.with.comments.js test/read-only/activity.test.js
git commit -m "fix: restore read-only activity scraping"
```

### Task 7: Build, Regression Tests, and Read-Only Live Smoke Verification

**Files:**
- Modify: `README.md`
- Modify: generated `dist/**` files corresponding to changed `lib/**` files

- [ ] **Step 1: Run the complete deterministic suite**

Run: `npm test`  
Expected: all read-only tests pass without network access or credentials.

- [ ] **Step 2: Run syntax/load checks**

Run: `node -e 'const api = require("./lib/linkedin.service"); if (!api.services || !api.tools) process.exit(1)'`  
Expected: exit 0.

- [ ] **Step 3: Regenerate distributable output**

Run: `npm run build`  
Expected: Babel completes and changed `dist/` modules mirror `lib/` behavior.

- [ ] **Step 4: Re-run tests against the package entry point**

Run: `node -e 'const api = require("."); console.log(Object.keys(api.services).sort().join(","))'`  
Expected: existing service names remain available.

- [ ] **Step 5: Perform authenticated read-only smoke checks**

Using the configured macOS Chrome English desktop context at an effective 1440×900 viewport, verify profile visit, connection status, connection listing, the user-provided message thread, and available activity pages. Do not click send, invite, connect, like, endorse, react, or comment controls. Record pass/skip/fail without cookies, message text, or personal data.

- [ ] **Step 6: Document the safe live-test boundary**

Update README with the supported desktop context, read-only smoke-test procedure, and an explicit statement that mutating workflows were not updated in this phase.

- [ ] **Step 7: Verify the diff and commit**

Run: `git diff --check && git status --short`  
Expected: no whitespace errors; only planned source, tests, docs, package metadata, and generated output are changed.

```bash
git add README.md dist package.json
git commit -m "docs: document read-only selector support"
```

## Verification Summary

Completion requires deterministic tests, build/load checks, and authenticated read-only smoke evidence. Live checks must use the user-approved regular LinkedIn surface and fixed macOS desktop profile. Login, 2FA, Sales Navigator, connections/invitations, message sending, likes, endorsements, reactions, and comments must not be executed as account mutations.
