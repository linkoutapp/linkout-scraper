# Linkout Scraper

Linkout 2 is a local Node.js library and read-only Claude Code/Codex plugin for inspecting LinkedIn through a visible, already-authenticated Chrome session on macOS.

It centralizes the 2026 LinkedIn selectors used by profiles, connection status, existing connections, message history, activity, guarded account actions, and Sales Navigator. The initial AI plugin exposes read-only operations only.

## Important limitation

LinkedIn says third-party software that scrapes or automates its website is prohibited. Running locally, using a persistent browser profile, adding delays, or setting daily limits does not guarantee compliance or prevent an account restriction. Linkout does not spoof fingerprints, hide automation, bypass CAPTCHA/checkpoints, use proxies, or claim to be undetectable.

See [LinkedIn's automated-activity policy](https://www.linkedin.com/help/linkedin/answer/a1340567/automated-activity-on-linkedin?lang=en) and [User Agreement](https://www.linkedin.com/legal/user-agreement) before use.

## Requirements

- macOS and stable Google Chrome
- Node.js 22 or newer
- the user's own machine and network connection
- a visible persistent Chrome profile in which the user signs in manually
- Chrome DevTools available only at `http://127.0.0.1:9222`

Chrome 136 and newer ignore `--remote-debugging-port` for the default Chrome data directory. Use a dedicated persistent directory and reuse that same directory every time:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="/absolute/path/to/persistent/linkout-chrome-profile"
```

Open LinkedIn in that Chrome window and sign in manually. Do not commit or share the profile directory. Chrome documents the custom-directory requirement in [its remote-debugging security notice](https://developer.chrome.com/blog/remote-debugging-port).

## Install and verify

```sh
npm install
npm test
python3 /path/to/plugin-creator/scripts/validate_plugin.py .
claude plugin validate .
```

`npm audit` is expected to report zero known vulnerabilities for the committed lockfile.

## Claude Code plugin

From the repository root:

```sh
claude --plugin-dir .
```

The plugin is named `linkout-linkedin-read`; its skill is namespaced as `linkout-linkedin-read:linkedin-read`.

## Codex plugin

The repository root contains `.codex-plugin/plugin.json`. Install or load this directory using the Codex plugin workflow. The manifest points to the shared `linkedin-read` skill and local stdio MCP server.

No marketplace entry is created automatically.

## Read-only MCP tools

- `linkedin_get_profile`
- `linkedin_get_connection_status`
- `linkedin_list_connections`
- `linkedin_read_message_thread`
- `linkedin_list_posts`
- `linkedin_list_reactions`
- `linkedin_list_comments`
- `linkedin_list_posts_with_comments`

These tools do not type, send, connect, invite, like, endorse, submit credentials or 2FA, or change Sales Navigator filters.

## CommonJS library compatibility

The historical `services` and `tools` names remain available:

```js
const Linkout = require("linkout-scraper");

const browser = await Linkout.tools.connectLocalChrome({
  browserURL: "http://127.0.0.1:9222",
});
const pages = await browser.pages();
const page = pages.find((candidate) => candidate.url().includes("linkedin.com"));

const result = await Linkout.services.visit(page, null, {
  url: "https://www.linkedin.com/in/example/",
});
```

Cookie login, email/password login, 2FA submission, and user-agent overrides now return migration errors. Sign in and complete verification manually in visible Chrome.

Connect, message, like, endorse, and Sales Navigator filter services remain library APIs, but they require `confirm: true` and an explicitly enabled local action policy. Their default policy disables every mutation. They are not MCP tools in this release.

## Device and interaction behavior

- only loopback Chrome DevTools endpoints are accepted by default;
- Chrome is connected, never launched or closed by the MCP server;
- the native browser user agent, locale, timezone, viewport, and fingerprint are preserved;
- ghost-cursor is used behind the visible input adapter, with native mouse fallback;
- keyboard input is per-character with bounded delays;
- login, checkpoint, CAPTCHA, automation warning, restriction, and unexpected modal states stop actions;
- local ledgers contain operation metadata only, never messages, passwords, cookies, or 2FA codes.

## Live selector checks

The default test suite is offline and performs no LinkedIn actions. See [docs/live-smoke-tests.md](docs/live-smoke-tests.md) for the explicit, read-only live smoke workflow.

## Credential cleanup

The old repository tracked an `.env` and executable credential examples. They have been removed from the current tree, but deletion does not erase Git history. Rotate any credential that was ever committed before using this branch.

## License

[MIT](LICENSE)
