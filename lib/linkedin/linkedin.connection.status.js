const { timer } = require("./linkedin.common.service");

async function connectionStatus(page, cdp, data) {
  const { user } = data;

  try {
    await page.goto(user);

    await timer(1000);

    await page.waitForSelector(".artdeco-card button:nth-child(2)");

    await timer(1000);

    const result = await page.evaluate(() => {
      const selector =
        "#profile-content > div > div > div > div > main > section > div > div > div > div > span > span.dist-value";
      const element = document.querySelector(selector);

      if (!element || !element.innerText.includes("1")) {
        if (document.querySelector('[aria-label*="Pending"]')) {
          return "Pending";
        } else {
          return "Not connected";
        }
      } else {
        return "Connected";
      }
    });

    return result;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = connectionStatus;
