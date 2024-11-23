const { createLinkedinUrl, timer } = require("./linkedin.common.service");

async function like(page, cdp, data) {
  const { url } = data;

  try {
    const activityUrl = await createLinkedinUrl(url, 2);

    await page.goto(activityUrl);

    await page.waitForSelector('button:has(svg[data-test-icon*="thumbs"])');

    await page.cursor.click('button:has(svg[data-test-icon*="thumbs"])');
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = like;