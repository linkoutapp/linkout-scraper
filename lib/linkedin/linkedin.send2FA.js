async function send2FA(page, cdp, data) {
  const { code } = data;

  try {
    const currentUrl = await page.url();

    if (currentUrl.includes("checkpoint")) {
      await page.waitForSelector(".input_verification_pin");

      await page.cursor.click(".input_verification_pin");

      if (code) {
        for (const char of code) {
          await page.keyboard.press(char, {
            delay: 30 + Math.floor(Math.random() * (50 - 50 + 1) + 50),
          });
        }

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
