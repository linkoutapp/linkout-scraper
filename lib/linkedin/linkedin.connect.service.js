const {
  scrapeProfileData,
  generateMessage,
  typeMessage,
  timer,
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
          `section.artdeco-card button[aria-label*="Invite ${profileData.firstName.trim()}"]`
        );

        await page.cursor.click(
          `section.artdeco-card button[aria-label*="Invite ${profileData.firstName.trim()}"]`
        );
      } catch (err) {
        try {
          // 3rd connection
          await page.waitForSelector(
            'section.artdeco-card button[aria-label*="More actions"]'
          );

          await timer(1000);

          await page.cursor.click(
            'section.artdeco-card button[aria-label*="More actions"]'
          );

          await page.waitForSelector(
            'section.artdeco-card div[aria-label*="to connect"]'
          );

          await timer(1000);

          await page.cursor.click(
            'section.artdeco-card div[aria-label*="to connect"]'
          );
        } catch (err) {}
      }

      if (message) {
        const replacedMessage = generateMessage(message, profileData);

        await page.waitForSelector('button[aria-label*="Add a note"]');

        await timer(1000);

        await page.cursor.click('button[aria-label*="Add a note"]');

        await page.waitForSelector('textarea[name*="message"]');

        await timer(1000);

        await typeMessage(page, replacedMessage, 'textarea[name*="message"]');
      }
    } else {
      console.error("An error occurred:", error);
    }

    await page.waitForSelector('button[aria-label*="Send now"]:not(:disabled)');

    await timer(1000);

    await page.cursor.click('button[aria-label*="Send now"]:not(:disabled)');
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = connect;
