const { createLinkedinUrl, timer } = require("./linkedin.common.service");

async function endorse(page, cdp, data) {
  const { url } = data;

  try {
    const skillsUrl = await createLinkedinUrl(url, 3);

    await page.goto(skillsUrl);

    await page.waitForSelector(".pvs-list__container");

    const endorseRes = await page.evaluate(() => {
      const endorseButtons = document.querySelectorAll('div[data-view-name="profile-component-entity"] button');

      for (const button of endorseButtons) {
        if (button.innerText.includes("Endorse") && !button.innerText.includes("Endorsed")) {
          return button.id;
        }
      }
      return null;
    });

    if (endorseRes) {
      page.cursor.click("#" + endorseRes);
    } else {
      console.error("An error occurred:", error);
    }
  } catch (error) {}
}

module.exports = endorse;