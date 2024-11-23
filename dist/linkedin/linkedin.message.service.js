const {
  scrapeProfileData,
  generateMessage,
  typeMessage,
  timer
} = require("./linkedin.common.service");

async function message(page, cdp, data) {
  const { url, message } = data;

  try {
    await page.goto(url);

    const profileData = await scrapeProfileData(page);

    if (!isValidProfileData(profileData)) {
      throw new Error("Profile data is incomplete or invalid");
    }

    const replacedMessage = generateMessage(message, profileData);

    await closePopups(page);
    await clickMessageButton(page);
    await typeAndSendMessage(page, replacedMessage);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function isValidProfileData(profileData) {
  return profileData && typeof profileData.fullName === "string" && profileData.fullName.trim() !== "" && typeof profileData.firstName === "string" && profileData.firstName.trim() !== "" && typeof profileData.lastName === "string" && profileData.lastName.trim() !== "";
}

async function closePopups(page) {
  const closeButtons = await page.$$('svg[data-test-icon="close-small"]');
  for (const button of closeButtons) {
    await page.cursor.click(button);
    await timer(500);
  }
}

async function clickMessageButton(page) {
  await page.waitForSelector('section.artdeco-card button[aria-label*="Message"]');
  await page.cursor.click('section.artdeco-card button[aria-label*="Message"]');
}

async function typeAndSendMessage(page, message) {
  await page.waitForSelector(".msg-form__contenteditable");

  await page.evaluate(() => {
    const textBoxes = document.querySelectorAll(".msg-form__contenteditable");
    const lastTextBox = textBoxes[textBoxes.length - 1];
    lastTextBox.classList.add("msg-current_textbox");
  });

  await page.cursor.click(".msg-current_textbox");
  await typeMessage(page, message, ".msg-current_textbox");

  await page.waitForSelector(".msg-form__send-button:not(:disabled)");
  await page.cursor.click(".msg-form__send-button:not(:disabled)");
}

module.exports = message;