# Selector Modernization Design

**Date:** 2026-07-22  
**Status:** Approved  
**Scope:** LinkedIn selector reliability and the minimum supporting runtime updates

## Goal

Make Linkout's LinkedIn automation selectors maintainable and testable against a 2026 Node.js and Puppeteer toolchain without breaking the existing `Linkout.services` and `Linkout.tools` public API.

## Current State

Selectors are embedded throughout service implementations and ad hoc executable files under `__tests__`. Many depend on generated CSS classes, exact English labels, deep DOM structure, or unbounded waits. The package has no automated test command, no lockfile, and uses Puppeteer 21 and Babel 6. Existing files called tests launch real sessions and one tracked example contains an authentication value.

## Chosen Approach

Use a hybrid testing model:

1. Centralize selectors by workflow, favoring stable semantic attributes and ordered fallbacks.
2. Test selector resolution deterministically against sanitized HTML fixtures in CI.
3. Provide explicit, opt-in live smoke tests for maintainers to run with their own environment credentials.
4. Update only the dependencies and build configuration needed for a maintained Node.js/Puppeteer baseline.

Fixture-only testing would not detect live LinkedIn DOM changes. Live-only testing would be slow, nondeterministic, credential-dependent, and unsuitable for CI. The hybrid model provides fast regression coverage while retaining a safe path for real-world validation.

## Architecture

### Selector Registry

A dedicated selector module will group candidates by workflow and element purpose, for example login controls, profile actions, messaging controls, feed content, and Sales Navigator filters. Each logical element may have multiple candidates ordered from strongest to weakest.

The registry will be data-only where practical. Service modules will request a logical selector instead of duplicating CSS strings. This keeps LinkedIn DOM churn localized and permits selector inventory tests.

### Selector Resolver

A small helper will:

- accept a page-like Puppeteer object, logical selector name, timeout, and optional visibility requirement;
- try candidates in order using bounded waits;
- return the first matching selector or element handle;
- throw a structured error containing the workflow, logical selector name, attempted candidates, current URL, and original cause;
- avoid logging cookies, credentials, messages, or page contents.

Services may retain direct selectors when they are genuinely unique and stable, but the selectors used for primary navigation and actions will use the registry and resolver.

### Workflow Updates

The implementation will inventory all selectors in `lib/` and prioritize the public workflows exported from `lib/linkedin.service.js`: login, connect, message, chat history, posts, reactions, comments, connection status, 2FA, visit, Sales Navigator scraping, accepted connections, like, and endorse.

Updates will prefer semantic hooks such as `aria-label`, `role`, element type, stable URL patterns, and accessible text. Generated class names and deep descendant chains will be fallbacks only. Where LinkedIn supplies no stable hook, selectors will be scoped to a stable container and documented.

### Tests and Fixtures

Automated tests will use Node's built-in test runner unless repository constraints discovered during implementation justify a small dedicated test dependency. Sanitized fixtures will model the minimum DOM required by each logical selector. Tests will cover:

- every registered selector group resolving its preferred candidate;
- fallback behavior when a preferred candidate is absent;
- bounded failure with actionable, secret-safe diagnostics;
- critical workflow branching through page-object mocks;
- registry integrity, including non-empty candidates and unique logical names;
- package loading and preservation of the current public exports.

Fixtures will contain no copied personal data, session tokens, or proprietary page dumps.

### Optional Live Smoke Tests

Live tests will be isolated behind a separate command and will never run from the default test command or CI. They will require environment variables supplied locally, skip cleanly when prerequisites are absent, use read-only navigation where possible, and avoid sending messages, invitations, likes, endorsements, or other account mutations by default.

Any mutating live workflow must require a separate explicit opt-in flag and is outside the default modernization acceptance criteria.

## Runtime and Package Updates

The project will target the maintained 2026 Node.js LTS line and a compatible maintained Puppeteer release. Babel 6 will be removed if the source runs directly on the target Node.js version; otherwise it will be replaced with a maintained build tool. A lockfile will be committed, obsolete development-only dependencies will be removed, and scripts will distinguish unit tests, fixture selector tests, build checks, and opt-in live smoke tests.

Dependency changes unrelated to selector execution, security, or testability are out of scope.

## Security Cleanup

Tracked authentication values and executable credential examples will be replaced with environment lookups and safe placeholders. `.env` will not be used as a committed source of credentials. Documentation will instruct maintainers to rotate any value previously committed because deleting it from the current tree does not remove it from Git history.

Rewriting Git history is not part of this change and must be handled separately with repository-owner coordination.

## Compatibility

The current CommonJS entry point and the shapes of `Linkout.services` and `Linkout.tools` will remain available. Service argument shapes will remain compatible unless a current call cannot work with maintained Puppeteer; any necessary incompatibility will be documented and covered by a migration note.

Generated `dist/` output will be made reproducible from `lib/`. Whether it remains committed will follow the package's publishing requirements, but source and generated output must not diverge.

## Error Handling

Selector timeouts will fail with a dedicated error rather than being silently swallowed. Optional UI branches may handle a missing selector explicitly, but broad empty `catch` blocks will not hide primary-action failures. Errors will identify the workflow and logical element while redacting secrets.

## CI and Verification

CI will run on supported Node.js versions and perform, at minimum:

- clean dependency installation;
- automated unit and fixture tests;
- source/package load checks;
- build verification when build output is required;
- a scan ensuring known credential patterns and local `.env` files are not tracked.

No CI job will authenticate to LinkedIn.

## Acceptance Criteria

- All selectors used by exported workflows are inventoried, with critical selectors centralized.
- Critical selectors have deterministic fixture coverage including at least one fallback path.
- Selector failures are bounded, actionable, and secret-safe.
- The default test command runs without LinkedIn credentials or network access.
- An optional non-mutating live smoke-test command is documented.
- Existing CommonJS consumers can load the package and access the same service/tool names.
- The project installs, tests, and builds on the selected maintained Node.js/Puppeteer baseline.
- No authentication token or real credential remains in the current tracked tree.

## Non-Goals

- Guaranteeing that LinkedIn will never change its DOM.
- Circumventing platform security controls or anti-automation systems.
- Running account-mutating live actions in CI.
- A full TypeScript, ESM, or public API rewrite.
- Git history rewriting or remote credential rotation.
