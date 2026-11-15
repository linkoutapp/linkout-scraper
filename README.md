<p align="center">
  <a href="https://github.com/linkoutapp/brand" aria-label="Linkout brand assets">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-transparent.svg">
      <img src="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-transparent.svg" alt="Linkout Scraper" width="180">
    </picture>
  </a>
</p>

# Linkout LinkedIn Scraper

[![MIT License](https://img.shields.io/badge/license-MIT-A143DA?labelColor=170460)](LICENSE)

Local LinkedIn tools for Node.js and read-only MCP clients. Use a visible Chrome session on macOS and sign in yourself.

- Scrape profiles and read message threads
- Read posts, reactions, comments, and connections
- Connection requests and messages through opt-in actions
- Endorse profiles, visit profiles, and like posts

## Install

Use Node.js 22 or newer.

```sh
npm install linkout-scraper --save
```

## Usage

Start Chrome with a separate persistent profile, then sign in to LinkedIn in that window:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="/absolute/path/to/linkout-chrome-profile" \
  https://www.linkedin.com/feed/
```

Replace the example URL with a profile you are authorized to read. This example reads a profile; it does not send a message or connection request.

```js
const Linkout = require("linkout-scraper");

(async () => {
  const browser = await Linkout.tools.connectLocalChrome();
  try {
    const page = (await browser.pages()).find((candidate) =>
      candidate.url().startsWith("https://www.linkedin.com/")
    );
    if (!page) throw new Error("Open LinkedIn in the configured Chrome window.");

    const result = await Linkout.services.visit(page, null, {
      url: "https://www.linkedin.com/in/example/",
    });
    console.log(result.profileData);
  } finally {
    await browser.disconnect();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
```

Actions are disabled by default. For explicit confirmation, action limits, persistent state, and release availability, see [SECURITY.md](SECURITY.md). Local execution does not guarantee account safety or compliance with LinkedIn rules.

## Maintainer

[Linkout](https://github.com/linkoutapp), maintained by [Sai-Adarsh](https://github.com/Sai-Adarsh).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, tests, and pull-request conventions. Report reproducible defects in [issues](https://github.com/linkoutapp/linkout-scraper/issues).

## License

[MIT](LICENSE).
