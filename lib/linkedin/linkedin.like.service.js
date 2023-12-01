const {
  createLinkedinUrl,
  timer,
  LinkedInErrors,
} = require("./linkedin.common.service");

async function like(page, cdp, data) {
  const { url } = data;

  try {
    const activityUrl = await createLinkedinUrl(url, 2);

    await page.goto(activityUrl);

    await page.waitForSelector('button[aria-label="React Like"]');

    await timer(3000);

    await page.cursor.click('button[aria-label="React Like"]');
  } catch (error) {
    console.error("An error occurred:", LinkedInErrors.NO_POSTS_FOUND);
  }
}

module.exports = like;
