<p align="center">
  <a href="">
    <img  alt="logo" src="https://raw.githubusercontent.com/linkoutapp/brand/main/scraper-transparent.svg"  height="128" width="128" />
  </a>
</p>

<h1 align="center">Linkout Linkedin Scraper</h1>

<p align="center">
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img alt="License: MIT License" src="https://img.shields.io/badge/License-MIT License-yellow.svg" />
  </a>
</p>

Here you can find secure scraping using Puppeteer for different LinkedIn actions

- [x] Login
- [x] Connection Request
- [x] Follow message
- [x] Visit Profile
- [x] Like posts
- [x] Endorse Profile

## Install

```sh
npm install linkout-scraper puppeteer --save
```

## Setup

- Get [LI_AT](https://youtu.be/H8BVdAIyFJM) - this token will be used to authenticate to user's LinkedIn profile.

## Usage

```javascript
const Linkout = require("../dist/linkedin.service");
const puppeteer = require("puppeteer-extra");
const dotenv = require("dotenv");

dotenv.config();

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const cdp = await page.target().createCDPSession();

  await page.setViewport({
    width: 1440,
    height: 900,
  });

  // add ghost-cursor for maximum safety
  await Linkout.tools.loadCursor(page, false);

  // remove webdriver detection
  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });

  await Linkout.tools.setUserAgent(page, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

  // Login with LinkedIn
  await Linkout.services.login(page, cdp, {
    cookie: LI_AT,
  });

  // Connect on LinkedIn
  await Linkout.services.connect(page, cdp, {
    message: "Hi {{firstName}}, let's connect!",
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  // Send a message on LinkedIn
  await Linkout.services.message(page, cdp, {
    message: "Got it, {{firstName}}!",
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });

  // Visit a LinkedIn profile
  await Linkout.services.visit(page, cdp, {
    url: "https://www.linkedin.com/in/sai-adarsh/",
  });
})();
```

## Who made this project

This project was made by [Linkout](https://linkout.space) - LinkedIn Outreach on Autopilot, and being maintained by [Sai Adarsh S](https://github.com/sai-adarsh). Any contribution is welcomed!

## 🤝 Contributing

[Please check our Contribution guide to get started!](https://github.com/linkoutapp/linkout-scraper/blob/main/CONTRIBUTING.md)

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/linkoutapp/linkout-scraper/issues?q=is%3Aopen).

- Fork the repository, Clone it on your device. That's it 🎉
- Finally make a pull request :)

## 📝 License

This project is [MIT License](https://opensource.org/licenses/MIT) licensed.
