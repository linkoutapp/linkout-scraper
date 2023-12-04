const { typeMessage, timer } = require("./linkedin.common.service");

async function send2FA(page, cdp, data) {
  const { code } = data;

  try {
    const currentUrl = await page.url();

    if (currentUrl.includes("checkpoint")) {
      await page.waitForSelector(".input_verification_pin");

      if (code) {
        await typeMessage(page, code, ".input_verification_pin");

        await timer(2000);

        await page.cursor.click('button[type="submit"]');
      } else {
        console.log("Invalid or empty 2FA code");
      }
    } else {
      console.log("Invalid 2FA page");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = send2FA;
