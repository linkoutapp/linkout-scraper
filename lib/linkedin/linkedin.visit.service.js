const { scrapeProfileData, timer } = require("./linkedin.common.service");
const LinkoutError = require("../errors/linkout-error");

async function visit(page, cdp, data) {
  const { url } = data;

  await page.goto(url);

  await timer(2000);

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
    return { profileData };
  }

  throw new LinkoutError(
    "PROFILE_NOT_FOUND",
    "Could not identify a profile heading on the LinkedIn page"
  );
}

module.exports = visit;
