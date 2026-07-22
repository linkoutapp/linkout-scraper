const scrapeProfileData = require("../helpers/scrapeProfileData");
const generateMessage = require("../helpers/generateMessage");
const LinkoutError = require("../errors/linkout-error");
const selectors = require("../selectors/actions").message;
const {
  clickAction,
  getActionPolicy,
  resolveAction,
  typeAction,
} = require("./mutation-runtime");

async function message(page, cdp, data = {}) {
  const { url, message: template, confirm = false } = data;
  await page.goto(url);
  const profileData = await scrapeProfileData(page);
  if (!profileData || !profileData.fullName) {
    throw new LinkoutError("PROFILE_NOT_FOUND", "Could not identify the target profile");
  }

  const policy = getActionPolicy(cdp, data);
  const transaction = await policy.begin({
    operation: "message",
    target: url,
    confirm,
    page,
  });

  try {
    await clickAction(page, "message", "open", selectors.open, data);
    await typeAction(
      page,
      "message",
      "editor",
      selectors.editor,
      generateMessage(String(template || ""), profileData),
      data
    );
    await clickAction(page, "message", "send", selectors.send, data);
    await resolveAction(page, "message", "success", selectors.success, data);
    await transaction.complete();
    return { status: "sent", profileData };
  } catch (error) {
    await transaction.reject(error.code || "MESSAGE_FAILED");
    throw error;
  }
}

module.exports = message;
