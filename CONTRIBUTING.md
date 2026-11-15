# Contributing to Linkout

Keep each pull request focused on one change. Describe the problem, the resulting behavior, and the checks you ran. Never include credentials, browser profiles, real message contents, or local action ledgers.

## Set up

Use Node.js 22 or newer. Unit tests do not require Chrome or a LinkedIn account.

```sh
git clone https://github.com/linkoutapp/linkout-scraper.git
cd linkout-scraper
npm ci
npm test
```

The package runs plain CommonJS JavaScript. There is no build step. The [package scripts](package.json) are the source of truth for available commands.

## Code conventions

Follow the surrounding code: two-space indentation, double-quoted strings, `async`/`await`, and `module.exports`. Keep browser access, policy checks, selectors, and service workflows in their existing directories. Search for a helper before adding another one.

Keep the exported API compatible unless the pull request explains a required migration. Preserve error codes and cleanup behavior. Confirm the target and action before any mutation, and keep sensitive values out of errors and logs.

## Tests

Add a regression case for a bug or changed behavior. Use synthetic pages, cookies, and messages. Normal tests must not sign in, contact LinkedIn, send requests, or rely on personal browser state.

Run a focused test while working, then the complete suite before opening the pull request:

```sh
node --test test/policy/*.test.js
npm test
git diff --check
```

Live checks are optional maintainer diagnostics. Read [the live smoke-test guide](docs/live-smoke-tests.md) before using its explicit opt-in command. They read real account data and are not part of the normal test gate.

## Before opening a pull request

- Explain behavior changes, compatibility effects, and validation results.
- Update README examples or documentation when the public behavior changes.
- Keep generated files, dependency updates, and unrelated cleanup out of a behavior fix unless they are required for it.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report sensitive issues through the contact in [SECURITY.md](SECURITY.md).
