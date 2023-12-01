const {
  createLinkedinUrl,
  timer,
  LinkedInErrors,
} = require("./linkedin.common.service");

async function endorse(page, cdp, data) {
  const { url } = data;

  try {
    const skillsUrl = await createLinkedinUrl(url, 3);

    await page.goto(skillsUrl);

    await page.waitForSelector(".pvs-list__container");

    await timer(3000);

    const endorseRes = await page.evaluate(() => {
      const endorseButtons = document.querySelectorAll("button span");

      for (const span of endorseButtons) {
        if (
          span.innerText.includes("Endorse") &&
          !span.innerText.includes("Endorsed")
        ) {
          span.parentElement.click();
          return true;
        }
      }
      return false;
    });

    if (!endorseRes)
      console.error(
        "An error occurred:",
        LinkedInErrors.NO_SKILLS_FOUND_PENDING_NOT_CONNECTED
      );
  } catch (error) {}
}

module.exports = endorse;
