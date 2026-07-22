const { findFirstSelector, findPageContext } = require("./find-page-context");
const selectors = require("../selectors/read-only");

async function scrapeProfileData(page) {
  const context = await findPageContext(page, selectors.profile.root);
  if (!context) {
    return null;
  }

  const selector = await findFirstSelector(context, selectors.profile.name);
  if (!selector) {
    return null;
  }

  const heading = await context.$(selector);
  const fullName = String(
    await heading.evaluate((element) => element.textContent || "")
  )
    .trim()
    .replace(/\s+/g, " ");

  if (!fullName) {
    return null;
  }

  const [firstName = "", ...remainingNameParts] = fullName.split(" ");

  return {
    fullName,
    firstName,
    lastName: remainingNameParts.join(" "),
  };
}

module.exports = scrapeProfileData;
