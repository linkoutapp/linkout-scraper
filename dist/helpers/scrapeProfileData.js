// scrapeProfileData.js

async function scrapeProfileData(page) {
  try {
    await page.waitForSelector(".pv-text-details__about-this-profile-entrypoint");

    const fullName = await page.evaluate(() => {
      const titleElement = document.querySelector(".pv-text-details__about-this-profile-entrypoint");
      const h1Element = titleElement.querySelector("h1");
      return h1Element.textContent.trim();
    });

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    if (typeof fullName === "string" && fullName !== "" && typeof firstName === "string" && firstName !== "" && typeof lastName === "string" && lastName !== "") {
      return {
        fullName,
        firstName,
        lastName
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