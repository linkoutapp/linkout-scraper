<div align="center">
  <a href="https://github.com/linkoutapp/brand" aria-label="Linkout brand assets">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-transparent.svg">
      <img src="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-transparent.svg" alt="Linkout Scraper" width="144">
    </picture>
  </a>

  <h1>Linkout Scraper</h1>

  <p><strong>Local LinkedIn tooling through your visible, signed-in Chrome.</strong></p>
  <p>Read-only Codex and Claude tools by default. Guarded actions when explicitly enabled.</p>

  <p>
    <img alt="Node.js 22+" src="https://img.shields.io/badge/Node.js-22%2B-A143DA?labelColor=170460">
    <img alt="macOS" src="https://img.shields.io/badge/platform-macOS-A143DA?labelColor=170460">
    <img alt="Local Chrome" src="https://img.shields.io/badge/browser-local%20Chrome-A143DA?labelColor=170460">
    <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-A143DA?labelColor=170460"></a>
  </p>
</div>

Linkout attaches to an existing Chrome session on your Mac. It keeps authentication, browsing, and network traffic on your machine while providing maintained LinkedIn selectors, bounded waits, page-state checks, and explicit mutation controls.

## Quick start

Requirements: macOS, Node.js 22+, stable Google Chrome, and a dedicated persistent Chrome profile.

```sh
npm install

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="/absolute/path/to/linkout-chrome-profile"
```

Sign in to LinkedIn manually in that Chrome window, then start the local MCP server:

```sh
npm start:mcp
```

Use the repository directly as a Claude Code plugin with `claude --plugin-dir .`, or load its `.codex-plugin/plugin.json` manifest in Codex.

## What it includes

| Surface | Capabilities |
| --- | --- |
| Read-only MCP | Profiles, connection status, connections, message threads, posts, reactions, and comments |
| CommonJS library | Read services plus guarded connect, message, like, endorse, and Sales Navigator actions |
| Local runtime | Existing-Chrome attachment, semantic selector fallbacks, bounded timing, action policy, and audit ledger |

<details>
<summary>Read-only MCP tools</summary>

- `linkedin_get_profile`
- `linkedin_get_connection_status`
- `linkedin_list_connections`
- `linkedin_read_message_thread`
- `linkedin_list_posts`
- `linkedin_list_reactions`
- `linkedin_list_comments`
- `linkedin_list_posts_with_comments`

</details>

Library mutations are disabled by default. Every action requires `confirm: true` and an explicitly enabled local action policy.

```js
const Linkout = require("linkout-scraper");

const browser = await Linkout.tools.connectLocalChrome();
const pages = await browser.pages();
const page = pages.find((candidate) => candidate.url().includes("linkedin.com"));

const result = await Linkout.services.visit(page, null, {
  url: "https://www.linkedin.com/in/example/",
});
```

## Safety

Linkout does not submit credentials or 2FA, spoof browser fingerprints, bypass CAPTCHA or checkpoints, use proxies, or promise undetectable automation. Security challenges, restrictions, automation warnings, and unexpected modals stop operations.

LinkedIn prohibits unauthorized scraping and automation. Review its [automated-activity policy](https://www.linkedin.com/help/linkedin/answer/a1340567/automated-activity-on-linkedin?lang=en) and [User Agreement](https://www.linkedin.com/legal/user-agreement) before use.

## Development

```sh
npm test
npm run test:live:read-only
```

The default suite is offline and performs no LinkedIn actions. The live smoke test is explicit and read-only; setup details are in [docs/live-smoke-tests.md](docs/live-smoke-tests.md).

Brand artwork is maintained in [linkoutapp/brand](https://github.com/linkoutapp/brand). Licensed under [MIT](LICENSE).
