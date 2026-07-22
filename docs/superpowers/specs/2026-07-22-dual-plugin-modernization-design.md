# 2026 Dual-Plugin Modernization Design

**Date:** 2026-07-22  
**Status:** Approved  
**Scope:** Full selector/runtime modernization, a shared local MCP service, and Claude Code/Codex plugin packaging

## Goal

Refactor Linkout into a maintained 2026 Node.js package whose existing LinkedIn workflows use centralized, tested selectors and whose read-only capabilities can be invoked from Claude Code and Codex through one local MCP server.

The runtime must use the member's visible, already-authenticated Google Chrome session on their own macOS computer and network. It must not claim to be undetectable, spoof a browser fingerprint, bypass challenges, or conceal automation. LinkedIn states that third-party software which scrapes or automates its website is prohibited, regardless of where it runs or how slowly it operates.

## Product Boundary

This change adopts the useful desktop-first properties in the supplied ZenMode material:

- run locally instead of on a shared cloud browser;
- attach to the user's normal, visible Chrome session;
- preserve the browser's native user agent and fingerprint;
- use bounded, non-uniform pacing for UI stability;
- keep conservative daily action budgets and business-hour controls;
- stop on login, checkpoint, CAPTCHA, warning, or unexpected UI state;
- require explicit user confirmation before any account mutation;
- keep a local, redacted activity ledger.

It does not implement fingerprint spoofing, CAPTCHA avoidance, stealth patches, proxy rotation, hidden background activity, or an “undetectable” guarantee. Human-like cursor and keypress helpers are interaction ergonomics only, not anti-detection controls.

## Scope and Staging

### This pull request

1. Modernize selectors for every workflow currently exported by `lib/linkedin.service.js`.
2. Refactor shared browser, selector, interaction, policy, error, and extraction layers.
3. Upgrade the Node.js/package baseline and remove obsolete or unsafe dependencies and examples.
4. Add a local stdio MCP server.
5. Package one shared skill/server as both a Codex plugin and Claude Code plugin.
6. Expose read-only plugin tools for profiles, connection status, connections, message history, posts, reactions, and comments.
7. Retain mutating library services, but guard them with confirmation and policy checks and verify them with deterministic fixtures rather than live actions.

### Deferred plugin exposure

Connections, invitations, messages, likes, endorsements, login submission, 2FA submission, Sales Navigator filter submission, and voice-message sending are not exposed as plugin tools in this pull request. Enabling them later requires a separate design review, per-action confirmation semantics, and explicit live-test authorization.

## Architecture

### Shared Core

The package remains CommonJS-compatible and keeps the existing `services` and `tools` names. Internally it is separated into:

- `selectors/`: data-only selector candidates grouped by workflow and logical element;
- `browser/`: native Chrome attachment, page acquisition, device validation, and checkpoint detection;
- `helpers/`: bounded selector resolution and frame-aware querying;
- `extractors/`: pure normalization of DOM-derived records;
- `interactions/`: cursor movement, keyboard typing, scrolling, and stable click/type primitives;
- `policy/`: confirmation, daily budgets, business hours, and local ledger;
- `linkedin/`: thin workflow orchestration using the layers above;
- `mcp/`: schemas, read-only tool handlers, and the stdio server.

The refactor may be incremental, but no exported workflow may retain unbounded loops, generated-class-only primary selectors, empty error swallowing, implicit globals, or raw credential logging.

### Native Chrome Session

The MCP server connects to an explicitly configured Chrome DevTools endpoint. It never launches a cloud browser or an isolated automation profile. The default checked-in device policy describes the supported environment:

- operating system: macOS (`darwin`);
- browser: stable Google Chrome;
- execution: visible, existing browser session;
- locale: the browser's native locale;
- timezone: the operating system's native timezone;
- network: the user's current local connection;
- profile: the user's existing Chrome profile.

Runtime fingerprint fields are observed only for diagnostics and are never overwritten. User-agent overrides, `puppeteer-extra-plugin-stealth`, cookie-token login, and synthetic fingerprint configuration are removed from the recommended path.

### Selector Registry and Resolver

Selectors are grouped by workflow and element purpose. Candidate order is:

1. semantic role, accessible name, stable input name, or stable URL pattern;
2. stable product-owned attributes such as `data-view-name`;
3. structural selectors scoped to a semantic container;
4. documented legacy class fallback.

The resolver searches the page and child frames, uses bounded polling, optionally requires visibility, and returns the matching context and selector. Failure raises a structured, secret-safe error containing the workflow, logical element, attempted candidates, URL origin/path, and timeout. It does not include cookies, message bodies, credentials, full DOM, or query parameters.

Text-dependent behavior supports normalization and multiple expected English label variants. Generated Ember IDs and obfuscated CSS hashes are never persisted as selectors.

### Read-Only Extraction

Read-only workflows navigate without clicking action controls and return normalized JSON:

- profile: full name and derived first/last name;
- connection status: `Connected`, `Pending`, or `Not connected` plus supporting signal;
- connections: unique member name and canonical profile URL;
- message history: sender, time, text, and profile URL from one direct thread;
- activity: canonical activity URL, actor, date, header context, text, and nested comments;
- posts, reactions, comments, and posts-with-comments: projections of the shared activity extractor.

Counts are validated and bounded. Duplicate records are removed by canonical profile path or activity URN. Direct activity URLs are derived from `data-urn` when possible instead of opening share menus.

### Interaction Layer

All clicks and typing in mutating library services use one adapter:

- ghost-cursor paths in visible Chrome where an element handle is available;
- Puppeteer's native mouse as a documented fallback;
- per-character keyboard input with bounded, configurable delays;
- condition-based waits before and after interaction;
- no JavaScript `element.click()` fallback for primary mutations;
- no negative or unbounded sleep durations.

The adapter exists to make interactions observable and robust. It must not modify browser APIs, navigator properties, canvas, WebGL, fonts, screen metrics, TLS behavior, or other fingerprint surfaces.

### Policy and Stop Conditions

Mutating library calls require `confirm: true`. Before a mutation, the policy layer checks:

- the operation is enabled locally;
- the current time is within configured operating hours;
- the per-operation daily budget has remaining capacity;
- the page is authenticated and not showing a warning or challenge;
- the target and proposed action are present in the audit record.

The action is counted only after an observable success state. The local ledger stores timestamps, operation names, target canonical URLs, outcome, and error codes, but not message contents, passwords, cookies, or 2FA codes. Defaults are conservative and configurable; they are safeguards, not claims about LinkedIn's current limits.

Any checkpoint, CAPTCHA, automated-activity warning, session expiry, selector ambiguity, or unexpected modal stops the workflow and returns a structured error. The library never attempts to solve or dismiss a security challenge.

## MCP and Plugin Packaging

### MCP Server

The stdio MCP server is a thin transport over the shared library. It emits protocol JSON only on stdout and sends diagnostics to stderr. Each tool validates input, acquires the configured visible Chrome page, runs one bounded read-only workflow, and returns JSON text plus structured content.

Initial tools:

- `linkedin_get_profile`
- `linkedin_get_connection_status`
- `linkedin_list_connections`
- `linkedin_read_message_thread`
- `linkedin_list_posts`
- `linkedin_list_reactions`
- `linkedin_list_comments`
- `linkedin_list_posts_with_comments`

No initial MCP tool types, clicks, sends, connects, likes, endorses, logs in, submits 2FA, or changes Sales Navigator filters.

### Shared Skill

One concise `linkedin-read` skill teaches Claude Code and Codex when and how to use the read-only MCP tools. It requires:

- an explicitly supplied LinkedIn URL or clearly identified current page;
- confirmation that a visible local Chrome session is already signed in;
- read-only tool selection;
- minimal collection and output;
- immediate stop/report on warnings, challenges, or authentication loss;
- no claim that local execution prevents restrictions.

The skill contains no credentials and delegates deterministic work to MCP tools.

### Codex Plugin

The package includes a `.codex-plugin/plugin.json` manifest and follows Codex plugin validation requirements. The plugin declares the shared skill and local MCP server using plugin-root-relative paths. It is repository-contained and versioned; it does not modify a personal marketplace automatically.

### Claude Code Plugin

The same plugin root includes `.claude-plugin/plugin.json`, the shared top-level `skills/` directory, and `.mcp.json` referencing `${CLAUDE_PLUGIN_ROOT}`. It must load with `claude --plugin-dir <path>` and pass Claude's plugin validation command when available.

## Dependencies and Packaging

- Target Node.js 22 LTS or newer maintained LTS supported by dependencies.
- Upgrade Puppeteer to a maintained release compatible with native Chrome attachment.
- Use the maintained official MCP JavaScript SDK.
- Remove Babel 6 and run CommonJS source directly unless packaging evidence requires compilation.
- Remove `puppeteer-extra`, the stealth plugin, `robotjs`, Express, CORS, and body-parser when no longer used.
- Retain `ghost-cursor` only behind the interaction adapter.
- Commit the generated lockfile.
- Do not commit generated browser profiles, ledgers, `.env`, cookies, tokens, or screenshots containing personal data.

## Tests

### Default offline suite

The default suite requires no browser, LinkedIn account, network, or credentials and covers:

- registry integrity and fallback ordering;
- resolver priority, frames, visibility, bounded timeout, and redacted errors;
- normalized profile, connection, message, and activity extraction;
- every exported workflow's critical current and legacy selector branches;
- mutating workflow confirmation, budget, hours, and stop-condition gates;
- interaction timing bounds and cursor/keyboard adapter behavior with mocks;
- MCP schemas, handler dispatch, protocol stdout discipline, and error mapping;
- preservation of CommonJS public exports;
- both plugin manifests and skill metadata;
- absence of tracked credential fixtures and prohibited fingerprint/stealth hooks.

Sanitized HTML fixtures contain invented names and content only.

### Opt-in live smoke suite

Live tests attach to the user's visible Chrome and perform only read-only checks. They are excluded from `npm test` and CI, require an explicit environment flag, validate the supported macOS/Chrome device, and stop if the current session is not already authenticated. Tests may use the supplied Nithis profile and message thread for read-only inspection, but never type, send, invite, react, or change data.

## Security Cleanup

- Remove tracked `.env` and replace it with `.env.example` containing placeholders.
- Remove committed authentication values and credential-bearing executable examples.
- Document that previously committed credentials must be rotated because tree cleanup does not erase Git history.
- Redact query strings and sensitive input values from errors and logs.
- Keep the DevTools endpoint local by default and reject non-loopback endpoints unless the caller makes a separate explicit insecure override.

## Compatibility and Migration

`require("linkout-scraper")` continues to return `{ services, tools }` with the existing names. Existing services accept the historical `(page, cdp, data)` shape. New safeguards may reject unsafe calls that previously proceeded silently; these are documented behavioral hardening, not silent API removal.

The recommended 2026 path is the MCP/plugin interface attached to existing Chrome. Cookie login and email/password automation remain available only long enough to produce an explicit deprecation error and migration guidance; they are not invoked by plugins.

## Verification and Acceptance Criteria

Completion requires evidence for every item:

- every selector in every exported workflow is inventoried and critical selectors are centralized;
- all exported workflows have deterministic current-DOM coverage and bounded failure behavior;
- read-only live smoke checks pass in the approved macOS Chrome session;
- no live test performs a LinkedIn mutation;
- browser attachment preserves the native fingerprint and rejects remote endpoints by default;
- stealth/fingerprint-spoofing code and obsolete credential flows are absent from the recommended path;
- ghost cursor and keypress emulation are encapsulated and fixture-tested;
- confirmation, limits, hours, ledger, and challenge stops guard library mutations;
- the MCP server exposes only the documented read-only tools and passes protocol tests;
- Codex and Claude plugin manifests validate and the shared skill validates;
- the package installs cleanly, `npm test` passes, and package loading succeeds on the selected Node baseline;
- the current tracked tree contains no real token, password, cookie, `.env`, or personal fixture dump;
- documentation explains setup, limitations, policy risk, live-test opt-in, and migration;
- commits use `Sai-Adarsh <saiadarshsivakumar@gmail.com>` and the pull request reports verification evidence.

## Non-Goals

- guaranteeing account safety, invisibility, or compliance;
- defeating LinkedIn anti-abuse, challenge, CAPTCHA, or fingerprinting systems;
- sending voice messages or bulk outreach in the initial plugins;
- running LinkedIn-authenticated tests in CI;
- rewriting Git history or rotating remote credentials automatically;
- publishing either plugin to a public marketplace in this pull request.

## References

- LinkedIn, “Automated activity on LinkedIn”: <https://www.linkedin.com/help/linkedin/answer/a1340567/automated-activity-on-linkedin?lang=en>
- LinkedIn User Agreement: <https://www.linkedin.com/legal/user-agreement>
- Claude Code plugin documentation: <https://code.claude.com/docs/en/plugins>
- Claude Code plugin reference: <https://code.claude.com/docs/en/plugins-reference>
- Supplied ZenMode desktop-automation articles: used as non-authoritative product-design input only.
