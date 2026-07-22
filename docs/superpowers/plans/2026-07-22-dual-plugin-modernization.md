# 2026 Dual-Plugin Modernization Implementation Plan

> **Execution:** Use `superpowers:executing-plans` task-by-task. Apply `superpowers:test-driven-development` to every behavior change and `superpowers:verification-before-completion` before publishing.

**Goal:** Modernize every exported Linkout workflow for the 2026 LinkedIn DOM, add safe local-browser infrastructure, and ship the read-only workflows as one Claude Code/Codex plugin backed by a shared MCP server.

**Architecture:** Keep the CommonJS compatibility surface while moving selectors, bounded resolution, browser attachment, interaction primitives, policy checks, and extraction into shared layers. Attach to visible local Chrome without fingerprint overrides. Expose only read-only MCP tools in this pull request; guard existing mutating library services with confirmations, budgets, hours, and stop conditions.

**Tech stack:** Node.js 22+, CommonJS, Node's built-in test runner, maintained Puppeteer, ghost-cursor behind an adapter, official MCP JavaScript SDK, Codex and Claude Code plugin manifests.

---

## Task 1: Complete the Shared Activity Extractor

**Files:**
- Modify: `lib/selectors/read-only.js`
- Create: `lib/helpers/scrape-activity.js`
- Modify: `lib/linkedin/linkedin.posts.js`
- Modify: `lib/linkedin/linkedin.reactions.js`
- Modify: `lib/linkedin/linkedin.comments.js`
- Modify: `lib/linkedin/linkedin.posts.with.comments.js`
- Modify: `test/read-only/selectors.test.js`
- Create: `test/read-only/activity.test.js`

1. Preserve the existing failing/passing activity tests and add service-projection tests for posts, reactions, comments, and posts-with-comments.
2. Run `node --test test/read-only/activity.test.js test/read-only/selectors.test.js` and record the service-projection failures.
3. Replace share-menu clicking and duplicated activity scraping with `scrapeActivityPage()` projections.
4. Derive canonical post URLs from activity URNs, validate bounded counts, and preserve the historical return shapes where meaningful.
5. Run the focused tests and `npm test`.
6. Commit: `fix: restore 2026 activity scraping`.

## Task 2: Add Structured Selector Resolution

**Files:**
- Create: `lib/errors/linkout-error.js`
- Modify: `lib/helpers/find-page-context.js`
- Create: `test/core/selector-resolver.test.js`

1. Add tests for candidate priority, child frames, visibility filtering, bounded polling, URL query redaction, and a structured `SELECTOR_NOT_FOUND` error.
2. Verify the new tests fail against the current nullable resolver.
3. Add `resolveSelector()` while retaining `findPageContext()` and `findFirstSelector()` compatibility helpers.
4. Ensure errors contain workflow, logical element, candidates, sanitized origin/path, and timeout only.
5. Run focused and full tests.
6. Commit: `refactor: add bounded selector resolution`.

## Task 3: Inventory All Exported Workflow Selectors

**Files:**
- Create: `lib/selectors/index.js`
- Create: `lib/selectors/auth.js`
- Create: `lib/selectors/actions.js`
- Create: `lib/selectors/sales-navigator.js`
- Modify: `lib/selectors/read-only.js`
- Create: `test/selectors/registry.test.js`

1. Add a registry test that enumerates every service exported by `lib/linkedin.service.js`, requires a workflow entry, and rejects empty candidates, generated Ember IDs, obfuscated hash classes, and deep `nth-child` chains as primary candidates.
2. Add fixture assertions for current semantic and legacy fallback candidates for login/checkpoint, connect, message, like, endorse, and Sales Navigator.
3. Verify failures identify every unregistered workflow.
4. Build the grouped registry and document each unavoidable legacy fallback inline.
5. Run selector and full suites.
6. Commit: `refactor: inventory 2026 workflow selectors`.

## Task 4: Add Native Chrome Attachment and Stop Detection

**Files:**
- Create: `config/device.macos.json`
- Create: `lib/browser/connect-local-chrome.js`
- Create: `lib/browser/detect-page-state.js`
- Create: `test/browser/connect-local-chrome.test.js`
- Create: `test/browser/detect-page-state.test.js`

1. Add tests requiring macOS, loopback-only DevTools endpoints, visible existing-browser connection, no launch call, and no user-agent/fingerprint mutation.
2. Add page-state fixtures for authenticated UI, login, checkpoint, CAPTCHA, automated-activity warning, and unexpected modal.
3. Verify tests fail before implementation.
4. Implement `connectLocalChrome()` with dependency injection for Puppeteer and `detectPageState()` returning structured states.
5. Reject non-loopback endpoints by default and never log endpoint query strings or browser cookies.
6. Run focused and full tests.
7. Commit: `feat: attach to visible local Chrome safely`.

## Task 5: Centralize Cursor, Keyboard, and Timing Primitives

**Files:**
- Create: `lib/interactions/timing.js`
- Create: `lib/interactions/browser-input.js`
- Modify: `lib/helpers/load-cursor.js`
- Modify: `lib/helpers/typeMessage.js`
- Modify: `lib/helpers/timer.js`
- Create: `test/interactions/browser-input.test.js`
- Create: `test/interactions/timing.test.js`

1. Add tests for bounded non-negative delays, injectable randomness, cursor-first movement/clicking, native mouse fallback, per-character keyboard typing, and challenge checks before/after actions.
2. Verify negative-delay and direct-click cases fail against current helpers.
3. Implement deterministic-testable timing and input adapters without navigator, canvas, WebGL, screen, font, UA, or fingerprint patches.
4. Keep ghost-cursor lazy and optional so package loading does not require native GUI state.
5. Preserve old helper exports as wrappers around the adapter.
6. Run focused and full tests.
7. Commit: `refactor: centralize visible browser input`.

## Task 6: Add Mutation Policy, Limits, Hours, and Ledger

**Files:**
- Create: `lib/policy/defaults.js`
- Create: `lib/policy/action-policy.js`
- Create: `lib/policy/ledger.js`
- Create: `test/policy/action-policy.test.js`
- Create: `test/policy/ledger.test.js`

1. Add tests for missing confirmation, disabled operation, outside-hours rejection, exhausted daily budget, challenge stop, successful reservation/completion, date rollover, and redaction of message/cookie/2FA contents.
2. Verify all tests fail before implementation.
3. Implement conservative configurable defaults, an injected clock, and a JSON-lines ledger under a caller-supplied local state directory.
4. Count successful mutations only; record rejected attempts without sensitive values.
5. Ensure the default plugin configuration has every mutation disabled.
6. Run focused and full tests.
7. Commit: `feat: guard mutating LinkedIn actions`.

## Task 7: Migrate Existing Mutating and Authentication Services

**Files:**
- Modify: `lib/linkedin/linkedin.connect.service.js`
- Modify: `lib/linkedin/linkedin.message.service.js`
- Modify: `lib/linkedin/linkedin.like.service.js`
- Modify: `lib/linkedin/linkedin.endorse.service.js`
- Modify: `lib/linkedin/linkedin.login.service.js`
- Modify: `lib/linkedin/linkedin.login.with.email.service.js`
- Modify: `lib/linkedin/linkedin.send2FA.js`
- Create: `test/workflows/mutations.test.js`
- Create: `test/workflows/auth-deprecation.test.js`

1. Add fixture/mocked-page tests for current selectors and every confirmation/policy/stop gate.
2. Require an observable success state before completing a ledger entry.
3. Verify tests fail with current direct cursor calls, infinite login wait, cookie injection, and swallowed errors.
4. Migrate connect/message/like/endorse to registry + resolver + input + policy layers.
5. Replace cookie, credential, and 2FA submission implementations with structured deprecation errors directing users to sign into visible Chrome manually.
6. Preserve exported service names and historical function signatures.
7. Run focused and full tests.
8. Commit: `refactor: harden mutating and auth workflows`.

## Task 8: Migrate Sales Navigator Without Plugin Exposure

**Files:**
- Modify: `lib/linkedin/linkedin.sales.nav.scraper.js`
- Create: `test/workflows/sales-navigator.test.js`

1. Add mocked current-DOM tests for filter expansion, current title, geography, industry, headcount, results extraction, and pagination/scroll bounds.
2. Add policy tests proving filter submission requires confirmation and is disabled by default.
3. Verify failures against the current generated/deep selectors.
4. Migrate to the central registry, bounded resolver, input adapter, and policy gate; split pure lead normalization from UI orchestration.
5. Return structured errors instead of empty catches.
6. Run focused and full tests.
7. Commit: `refactor: update Sales Navigator selectors`.

## Task 9: Preserve and Verify the Compatibility Surface

**Files:**
- Modify: `lib/linkedin.service.js`
- Modify: `lib/linkedin/linkedin.common.service.js`
- Create: `test/package/exports.test.js`

1. Add tests asserting all historical `services` and `tools` names still exist and the package loads without opening a browser.
2. Add tests for new safe tools: local Chrome connection, selector resolution, page-state detection, and action policy creation.
3. Verify the new exports fail first.
4. Export the new helpers without removing old names.
5. Run focused and full tests.
6. Commit: `refactor: preserve Linkout compatibility exports`.

## Task 10: Implement the Read-Only MCP Server

**Files:**
- Create: `lib/mcp/tool-definitions.js`
- Create: `lib/mcp/handlers.js`
- Create: `lib/mcp/server.js`
- Create: `bin/linkout-mcp.js`
- Create: `test/mcp/tool-definitions.test.js`
- Create: `test/mcp/handlers.test.js`
- Create: `test/mcp/server.test.js`

1. Add tests for exactly eight read-only tool names, JSON schemas, URL/count validation, handler-to-service mapping, structured errors, and zero mutation/auth tools.
2. Add a spawned-process protocol test proving stdout contains MCP protocol traffic only and diagnostics use stderr.
3. Verify tests fail before server files exist.
4. Implement the stdio server with the official MCP SDK and dependency-injected handlers.
5. Acquire one visible local Chrome connection per server lifecycle and close only the protocol connection, never the user's Chrome process.
6. Run focused and full tests.
7. Commit: `feat: add read-only LinkedIn MCP server`.

## Task 11: Create and Validate the Shared Plugin Skill

**Files:**
- Create: `skills/linkedin-read/SKILL.md`
- Create: `skills/linkedin-read/agents/openai.yaml`
- Create: `test/plugin/skill.test.js`

1. Add static/application tests that fail when the skill does not exist and require correct triggering, visible signed-in Chrome, minimal read-only collection, warning stops, and no safety guarantee.
2. Run the skill initializer from the bundled `skill-creator` with interface values for “LinkedIn Read”.
3. Replace the template with the minimal tested instructions; do not add auxiliary skill documentation.
4. Run `quick_validate.py`, focused tests, and the full suite.
5. Because subagent spawning is not authorized for this task, record that independent pressure-scenario forward-testing was unavailable; compensate with explicit application fixtures and validator evidence.
6. Commit: `feat: add shared LinkedIn read skill`.

## Task 12: Package Codex and Claude Code Plugins

**Files:**
- Create: `.codex-plugin/plugin.json`
- Create: `.claude-plugin/plugin.json`
- Create: `.mcp.json`
- Create: `mcp/codex.json`
- Create: `test/plugin/manifests.test.js`

1. Add tests for strict semver, matching names/versions/authors, real relative paths, shared skill discovery, local stdio server commands, and no mutation capability declarations.
2. Run the Codex `create_basic_plugin.py` scaffold in a temporary directory to obtain a validation-ready manifest shape; port only the required root-repository files with `apply_patch`.
3. Add the Claude manifest and MCP config following the official plugin reference, using `${CLAUDE_PLUGIN_ROOT}` where required.
4. Resolve Codex server paths using its validated plugin-root convention; do not assume Claude variables exist in Codex.
5. Run Codex `validate_plugin.py`, Claude `claude plugin validate .` when available, focused tests, and the full suite.
6. Commit: `feat: package Claude and Codex plugins`.

## Task 13: Modernize Dependencies and Remove Unsafe Legacy Paths

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: generated `dist/` only if package metadata no longer references it
- Modify/Delete: obsolete server/bootstrap files discovered by `npm` dependency tracing
- Create: `test/security/source-scan.test.js`

1. Add source-scan tests rejecting `puppeteer-extra-plugin-stealth`, `puppeteer-extra`, `robotjs`, `setUserAgent` usage, navigator/canvas/WebGL fingerprint patches, infinite waits, and tracked credential patterns.
2. Verify the scan fails against the legacy tree.
3. Set Node engine support, point `main` at runnable source or a verified build artifact, add MCP/bin scripts, and update maintained dependencies.
4. Remove Babel 6 and unused Express/CORS/body-parser dependencies after proving they have no callers.
5. Run a clean `npm install`, inspect `npm audit`, and avoid force-upgrading across incompatible APIs without tests.
6. Run full tests and package-load checks.
7. Commit: `build: modernize the 2026 Node package`.

## Task 14: Remove Tracked Secrets and Add Safe Documentation

**Files:**
- Delete: `.env`
- Create: `.env.example`
- Modify/Delete: credential-bearing files under `__tests__/`
- Modify: `.gitignore`
- Modify: `README.md`
- Create: `docs/live-smoke-tests.md`
- Create: `test/security/tracked-files.test.js`

1. Add tests/scans proving `.env`, real `li_at` values, passwords, tokens, browser profiles, ledgers, and personal DOM dumps are not tracked.
2. Verify the checks fail against the current tree.
3. Remove current-tree secrets and replace examples with placeholders.
4. Document native Chrome startup/attachment, macOS device policy, read-only tools, plugin loading, live-test opt-in, policy limitations, credential rotation, and migration from automated login.
5. State clearly that local execution and pacing do not guarantee compliance or prevent restriction.
6. Run security scans and full tests.
7. Commit: `docs: secure local plugin setup`.

## Task 15: Add and Run Opt-In Live Read-Only Smoke Tests

**Files:**
- Create: `test/live/read-only.smoke.js`
- Modify: `package.json`
- Modify: `docs/live-smoke-tests.md`

1. Add tests that skip unless `LINKOUT_LIVE_READ_ONLY=1`, require loopback CDP, verify macOS Chrome, and assert the source contains no keyboard/click mutation calls.
2. Add smoke cases for the approved Nithis profile and direct message thread plus the authenticated user's connections/activity pages.
3. Run offline tests first.
4. Start or reuse the user's visible Chrome debugging session without changing profile, UA, locale, timezone, viewport fingerprint, or network.
5. Run `npm run test:live:read-only` and record sanitized pass/fail evidence only.
6. If LinkedIn displays a challenge/warning, stop immediately and do not retry around it.
7. Commit: `test: add opt-in live selector smoke checks`.

## Task 16: Completion Audit and Pull Request

**Files:**
- Modify only files required by verification findings.

1. Read `superpowers:verification-before-completion` and `superpowers:requesting-code-review`.
2. Map every acceptance criterion in the approved design to a current file, test, validator, or live result; treat missing evidence as incomplete.
3. Run from a clean install state:
   - `npm install`
   - `npm test`
   - MCP protocol tests
   - Codex plugin validator
   - Claude plugin validator when installed
   - package-load and `npm pack --dry-run` checks
   - `git diff --check`
   - tracked-secret/source scans
4. Re-run the authorized read-only live smoke suite if the session remains healthy.
5. Confirm every commit and repository config uses `Sai-Adarsh <saiadarshsivakumar@gmail.com>`.
6. Use `github:yeet` to inspect scope, push `fix/read-only-selector-fixes`, and open a draft pull request with limitations and exact verification evidence.
7. Report the PR URL and any non-blocking audit findings; do not claim “undetectable” or guaranteed account safety.
