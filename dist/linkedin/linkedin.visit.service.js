const { scrapeProfileData, timer } = require("./linkedin.common.service");

async function visit(page, cdp, data) {
  const { url } = data;

  try {
    await page.goto(url);

    await timer(2000);

    const profileData = await scrapeProfileData(page);

    if (profileData && typeof profileData.fullName === "string" && profileData.fullName.trim() !== "" && typeof profileData.firstName === "string" && profileData.firstName.trim() !== "" && typeof profileData.lastName === "string" && profileData.lastName.trim() !== "") {
      return { profileData };
    } else {
      console.error("An error occurred:", LinkedInErrors.FAILED_SCRAPING_PROFILE);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = visit;