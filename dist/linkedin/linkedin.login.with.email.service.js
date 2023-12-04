const { timer } = require("./linkedin.common.service");

async function waitForSelectorInfinite(page, selector) {
  while (true) {
    try {
      await page.waitForSelector(selector, { timeout: 1000 });
      break;
    } catch (error) {}
  }
}

async function loginWithEmail(page, cdp, data) {
  try {
    await page.goto("https://www.linkedin.com/login");

    await page.waitForSelector("#username");

    await timer(4000);

    await page.cursor.click("#username");

    await (await page.$("#username")).type(data.user, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50)
    });

    await timer(500);

    await page.cursor.click("#password");

    await (await page.$("#password")).type(data.password, {
      delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50)
    });

    await timer(1000);

    await page.cursor.click("button[type=submit]");

    await timer(3000);

    await waitForSelectorInfinite(page, ".search-global-typeahead__input");

    const token = await page.cookies();

    return {
      user: data.user,
      token: token.find(t => t.name === "li_at").value
    };
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = loginWithEmail;