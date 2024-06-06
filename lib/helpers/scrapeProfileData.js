// scrapeProfileData.js

async function scrapeProfileData(page) {
  try {
    await page.waitForSelector("h1");

    const fullName = await page.evaluate(() => {
      return document.querySelector("h1").textContent.trim();
    });

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    if (
      typeof fullName === "string" &&
      fullName !== "" &&
      typeof firstName === "string" &&
      firstName !== "" &&
      typeof lastName === "string" &&
      lastName !== ""
    ) {
      return {
        fullName,
        firstName,
        lastName,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

module.exports = scrapeProfileData;
