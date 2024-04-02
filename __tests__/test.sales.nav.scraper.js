const Linkout = require("../dist/linkedin.service");
const puppeteer = require("puppeteer-extra");
const dotenv = require("dotenv");
const { timer } = require("../dist/linkedin/linkedin.common.service");

dotenv.config();

async function applyCurrentTitle(page, cdp, currentTitle) {
  await page.waitForSelector("fieldset[title='Current job title']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector(
      "fieldset[title='Current job title'] .artdeco-button"
    ).ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click(
      "fieldset[title='Current job title'] .artdeco-button"
    );
  }

  await page.waitForSelector('input[placeholder="Add current titles"]');

  await page.focus('input[placeholder="Add current titles"]');

  for (const each of currentTitle) {
    await (
      await page.$('input[placeholder="Add current titles"]')
    ).type(each, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
    });

    try {
      await page.waitForSelector('div[title*="Include"]');

      await page.cursor.click('div[title*="Include"]');
    } catch (e) {
      //
    }
    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyGeography(page, cdp, geography) {
  await page.waitForSelector("fieldset[title='Geography']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector("fieldset[title='Geography'] .artdeco-button")
      .ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click("fieldset[title='Geography'] .artdeco-button");
  }

  await page.waitForSelector('input[placeholder="Add locations"]');

  await page.focus('input[placeholder="Add locations"]');

  for (const each of geography) {
    await (
      await page.$('input[placeholder="Add locations"]')
    ).type(each, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
    });

    try {
      await page.waitForSelector('div[title*="Include"]');

      await page.cursor.click('div[title*="Include"]');
    } catch (e) {
      //
    }

    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyIndustry(page, cdp, industry) {
  await page.waitForSelector("fieldset[title='Industry']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector("fieldset[title='Industry'] .artdeco-button")
      .ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click("fieldset[title='Industry'] .artdeco-button");
  }

  await page.waitForSelector('input[placeholder="Add industries"]');

  await page.focus('input[placeholder="Add industries"]');

  for (const each of industry) {
    await (
      await page.$('input[placeholder="Add industries"]')
    ).type(each, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
    });

    try {
      await page.waitForSelector('div[title*="Include"]');

      await page.cursor.click('div[title*="Include"]');
    } catch (e) {
      //
    }

    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyHeadCount(page, cdp, headcount) {
  await page.waitForSelector("fieldset[title='Company headcount']");

  const ariaExpanded = await page.evaluate(() => {
    return document.querySelector(
      "fieldset[title='Company headcount'] .artdeco-button"
    ).ariaExpanded;
  });

  if (ariaExpanded === "false") {
    await page.cursor.click(
      "fieldset[title='Company headcount'] .artdeco-button"
    );
  }

  await page.waitForSelector("fieldset[title='Company headcount'] li div");

  for (const each of headcount) {
    if (each.includes("1-10")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='1-10'] div"
      );
    } else if (each.includes("11-50")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='11-50'] div"
      );
    } else if (each.includes("201-500")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='201-500'] div"
      );
    } else if (each.includes("501-1000")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='501-1000'] div"
      );
    } else if (each.includes("1001-5000")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='1001-5000'] div"
      );
    } else if (each.includes("5001-10000")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='5001-10000'] div"
      );
    } else if (each.includes("10,000+")) {
      await page.cursor.click(
        "fieldset[title='Company headcount'] li[aria-label*='10,000+'] div"
      );
    }

    await page.waitForSelector(".artdeco-list");
  }

  await page.waitForSelector(".artdeco-list");
}

async function applyFilters(page, cdp, data) {
  const {
    headcount = [],
    currentTitle = [],
    geography = [],
    industry = [],
  } = data;

  if (headcount && headcount.length > 0) {
    await applyHeadCount(page, cdp, headcount);
  }

  if (currentTitle && currentTitle.length > 0) {
    await applyCurrentTitle(page, cdp, currentTitle);
  }

  await timer(1000);

  if (geography && geography.length > 0) {
    await applyGeography(page, cdp, geography);
  }

  await timer(1000);

  if (industry && industry.length > 0) {
    await applyIndustry(page, cdp, industry);
  }
}

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
    cookie:
      "AQEDAQVzqPQBGAhYAAABjfsLPCsAAAGOHxfAK1YAX8-Qz489VISutcmRlJ52_7ElNteyLwrNgbIA3M_AE4u8tgJ_DqwC__zDVn0lB4oAKRVrtkRhZR426F60N6wZJdtZV7Ly5Qelw50GbD0T3ptNHjVy",
  });

  await page.goto(
    "https://www.linkedin.com/sales/search/people?viewAllFilters=true"
  );

  await applyFilters(page, cdp, {
    // "1-10"
    // "11-50"
    // "51-200"
    // "201-500"
    // "501-1000"
    // "1001-5000"
    // "5001-10000"
    // "10,000+"
    headcount: ["11-50", "1-10"],
    currentTitle: ["Data Engineer", "Software Engineer"],
    geography: ["Chicago", "Bengaluru"],
    industry: ["Semi", "Pharma"],
  });
})();
