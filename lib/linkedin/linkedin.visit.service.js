const scrapeProfileData = require("../helpers/scrapeProfileData");
const timer = require("../helpers/timer");
const LinkoutError = require("../errors/linkout-error");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");

async function visit(page, cdp, data) {
  const { url } = data;

  await navigateLinkedIn(page, url, data);

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
