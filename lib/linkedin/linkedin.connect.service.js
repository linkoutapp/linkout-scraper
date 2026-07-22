const scrapeProfileData = require("../helpers/scrapeProfileData");
const generateMessage = require("../helpers/generateMessage");
const LinkoutError = require("../errors/linkout-error");
const selectors = require("../selectors/actions").connect;
const {
  clickAction,
  getActionPolicy,
  resolveAction,
  typeAction,
} = require("./mutation-runtime");

async function openConnectionDialog(page, data) {
  try {
    return await clickAction(page, "connect", "primary", selectors.primary, data);
  } catch (error) {
    if (error.code !== "SELECTOR_NOT_FOUND") throw error;
    await clickAction(page, "connect", "moreActions", selectors.moreActions, data);
    return clickAction(page, "connect", "menuItem", selectors.menuItem, data);
  }
}

async function connect(page, cdp, data = {}) {
  const { url, message, confirm = false } = data;
  await page.goto(url);

  const profileData = await scrapeProfileData(page);
  if (!profileData || !profileData.fullName) {
    throw new LinkoutError("PROFILE_NOT_FOUND", "Could not identify the target profile");
  }

  const policy = getActionPolicy(cdp, data);
  const transaction = await policy.begin({
    operation: "connect",
    target: url,
    confirm,
    page,
  });

  try {
    await openConnectionDialog(page, data);
    if (message) {
      await clickAction(page, "connect", "addNote", selectors.addNote, data);
      await typeAction(
        page,
        "connect",
        "note",
        selectors.note,
        generateMessage(message, profileData),
        data
      );
    }
    await clickAction(page, "connect", "send", selectors.send, data);
    await resolveAction(page, "connect", "success", selectors.success, data);
    await transaction.complete();
    return { status: "sent", profileData };
  } catch (error) {
    await transaction.reject(error.code || "CONNECT_FAILED");
    throw error;
  }
}

module.exports = connect;
module.exports.openConnectionDialog = openConnectionDialog;
