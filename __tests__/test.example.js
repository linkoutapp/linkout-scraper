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

  const { token } = await Linkout.services.loginWithEmail(page, cdp, {
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
  });

  await page.setCookie({
    name: "li_at",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "None",
    priority: "Medium",
    path: "/",
    domain: ".linkedin.com",
  });

  const comments = await Linkout.services.comments(page, cdp, {
    user: "https://www.linkedin.com/in/arshiya-mankar-1158a11a5/",
    count: 2,
  });

  console.log(comments);
})();
