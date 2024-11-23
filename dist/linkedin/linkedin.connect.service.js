const {
  scrapeProfileData,
  generateMessage,
  typeMessage,
  timer
} = require("./linkedin.common.service");

async function connect(page, cdp, data) {
  const { url, message } = data;

  try {
    await page.goto(url);
    const profileData = await scrapeProfileData(page);

    if (!isValidProfileData(profileData)) {
      console.error("Invalid profile data");
      return;
    }

    await handleConnectionButton(page, profileData.firstName.trim());
    if (message) {
      console.log(`Sending message: ${message}`);
    }
    if (message) {
      await handleMessage(page, message, profileData);
    }

    await sendInvitation(page);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function isValidProfileData(profileData) {
  return profileData && typeof profileData.fullName === "string" && profileData.fullName.trim() !== "" && typeof profileData.firstName === "string" && profileData.firstName.trim() !== "" && typeof profileData.lastName === "string" && profileData.lastName.trim() !== "";
}

async function handleConnectionButton(page, firstName) {
  try {
    await clickButton(page, `section.artdeco-card button[aria-label*="Invite ${firstName}"]`);
  } catch (err) {
    try {
      await clickButton(page, 'section.artdeco-card button[aria-label*="More actions"]');
      await clickButton(page, 'section.artdeco-card div[aria-label*="to connect"]');
    } catch (err) {
      console.error("Failed to find connection button:", err);
    }
  }
}

async function clickButton(page, selector) {
  await page.waitForSelector(selector);
  await timer(1000);
  await page.cursor.click(selector);
}

async function handleMessage(page, message, profileData) {
  const replacedMessage = generateMessage(message, profileData);
  await page.waitForSelector('textarea[name*="message"]');
  await timer(1000);
  await typeMessage(page, replacedMessage, 'textarea[name*="message"]');
}

async function sendInvitation(page) {
  try {
    const sendButtonSelector = 'button[aria-label*="Send invitation"]:not(:disabled)';
    await page.waitForSelector(sendButtonSelector);
    await timer(1000);
    await page.cursor.click(sendButtonSelector);
  } catch (err) {
    // If personalized invitations are exhausted, try sending without a note
    const sendWithoutNoteSelector = 'button[aria-label*="Send without a note"]:not(:disabled)';
    await page.waitForSelector(sendWithoutNoteSelector);
    await timer(1000);
    await page.cursor.click(sendWithoutNoteSelector);
  }
}

module.exports = connect;