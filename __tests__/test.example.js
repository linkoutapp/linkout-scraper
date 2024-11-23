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

  await Linkout.tools.setUserAgent(page, process.env.USER_AGENT);

  await Linkout.services.login(page, cdp, {
    cookie: "",
  });
})();
