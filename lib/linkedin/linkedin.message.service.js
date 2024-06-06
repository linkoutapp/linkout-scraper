const {
  scrapeProfileData,
  generateMessage,
  typeMessage,
  timer,
} = require("./linkedin.common.service");

async function message(page, cdp, data) {
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
      const replacedMessage = generateMessage(message, profileData);

      await page.waitForSelector(
        'section.artdeco-card button[aria-label*="Message"]'
      );

      // await timer(3000);

      await page.cursor.click(
        'section.artdeco-card button[aria-label*="Message"]'
      );

      await page.waitForSelector(".msg-form__contenteditable");

      // await timer(3000);

      await page.evaluate(() => {
        const textBoxes = document.querySelectorAll(
          ".msg-form__contenteditable"
        );
        const lastTextBox = textBoxes[textBoxes.length - 1];
        lastTextBox.classList.add("msg-current_textbox");
      });

      await page.cursor.click(".msg-current_textbox");

      // await timer(3000);

      await typeMessage(page, replacedMessage, ".msg-current_textbox");

      await page.waitForSelector(".msg-form__send-button:not(:disabled)");

      // await timer(3000);

      await page.cursor.click(".msg-form__send-button:not(:disabled)");
    } else {
      console.error("Profile data is incomplete or invalid");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = message;
