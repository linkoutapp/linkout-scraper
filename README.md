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

Local LinkedIn automation through a visible, signed-in Chrome session.

- Use an existing LinkedIn session
- Scrape profiles
- Connection requests
- Send messages
- Read message threads
- Endorse profiles
- Visit profiles
- Like posts
- Posts, reactions and comments

## Install

```sh
npm install github:linkoutapp/linkout-scraper#main --save
```

The npm registry release is blocked until npm package publishing access is recovered. Use the GitHub dependency for the current Linkout runtime.

## Usage

Start Chrome on the configured macOS device. Sign in to LinkedIn manually. Run Linkout against that browser.

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --window-size=1440,900 \
  --user-data-dir="/absolute/path/to/linkout-chrome-profile"
```

```js
const Linkout = require("linkout-scraper");

(async () => {
  const browser = await Linkout.tools.connectLocalChrome();
  const pages = await browser.pages();
  const page =
    pages.find((candidate) => candidate.url().includes("linkedin.com")) ||
    (await browser.newPage());

  await page.setViewport({
    width: 1440,
    height: 900,
  });
  await Linkout.tools.loadCursor(page, true);

  const actionPolicy = Linkout.tools.createActionPolicy({
    config: {
      operatingHours: { start: 9, end: 18 },
      operations: {
        connect: { enabled: true, dailyLimit: 10 },
      },
    },
  });

  await Linkout.services.connect(
    page,
    { actionPolicy },
    {
      confirm: true,
      message: "Hello.",
      url: "https://www.linkedin.com/in/example/",
    }
  );
})();
```

Linkout keeps authentication on your device. It does not submit credentials, set LinkedIn cookies, use proxies, or accept browser fingerprint overrides.

## Maintainer

[Linkout](https://github.com/linkoutapp). Maintained by [Sai-Adarsh](https://github.com/Sai-Adarsh).

## Contributing

Issues and pull requests: [linkoutapp/linkout-scraper](https://github.com/linkoutapp/linkout-scraper/issues).

- Fork the repository and clone it on your device.
- Open a pull request.

## License

[MIT](LICENSE).
