const {
  scrapeProfileData,
  generateMessage,
  typeMessage,
  timer,
  LinkedInErrors,
} = require("./linkedin.common.service");

async function connect(page, cdp, data) {
  const { url, message } = data;

  try {
    await page.goto(url);

    const profileData = await scrapeProfileData(page);

    if (
      profileData &&
      typeof profileData.fullName === "string" &&
      profileData.fullName.trim() !== "" &&
      typeof profileData.firstName === "string" &&
      profileData.firstName.trim() !== "" &&
      typeof profileData.lastName === "string" &&
      profileData.lastName.trim() !== ""
    ) {
      try {
        // 2nd/3rd connection
        await page.waitForSelector(
          `button[aria-label*="Invite ${profileData.firstName.trim()}"]`
        );

        await page.evaluate(async (profileData) => {
          document
            .querySelector(
              `button[aria-label*="Invite ${profileData.firstName.trim()}"]`
            )
            .click();
        }, profileData);
      } catch (err) {
        try {
          // 3rd connection
          await page.waitForSelector('button[aria-label*="More actions"]');

          await timer(3000);

          await page.evaluate(() => {
            document
              .querySelector(`button[aria-label*="More actions"]`)
              .click();
          });

          await page.waitForSelector('div[aria-label*="to connect"]');

          await timer(3000);

          await page.evaluate(() => {
            document.querySelector(`div[aria-label*="to connect"]`).click();
          });
        } catch (err) {}
      }

      if (message) {
        const replacedMessage = generateMessage(message, profileData);

        await page.waitForSelector('button[aria-label*="Add a note"]');

        await timer(3000);

        await page.cursor.click('button[aria-label*="Add a note"]');

        await page.waitForSelector('textarea[name*="message"]');

        await timer(3000);

        await typeMessage(page, replacedMessage, 'textarea[name*="message"]');
      }
    } else {
      console.error(
        "An error occurred:",
        LinkedInErrors.FAILED_SCRAPING_PROFILE
      );
    }

    await page.waitForSelector('button[aria-label*="Send now"]:not(:disabled)');

    await timer(3000);

    await page.cursor.click('button[aria-label*="Send now"]:not(:disabled)');
  } catch (error) {
    console.error(
      "An error occurred:",
      LinkedInErrors.CONNECT_PENDING_NOT_CONNECTED_LIMIT_EXCEEDED
    );
  }
}

module.exports = connect;
