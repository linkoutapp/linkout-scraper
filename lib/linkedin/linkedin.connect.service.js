const scrapeProfileData = require("../helpers/scrapeProfileData");
const generateMessage = require("../helpers/generateMessage");
const LinkoutError = require("../errors/linkout-error");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");
const selectors = require("../selectors/actions").connect;
const { clickVisible } = require("../interactions/browser-input");
const {
  assertAction,
  clickAction,
  disposeResolved,
  getActionPolicy,
  interactionOptions,
  resolveAction,
  typeAction,
} = require("./mutation-runtime");

function isCustomInviteHref(href) {
  return /\/preload\/custom-invite\//i.test(String(href || ""));
}

async function activateConnectionTarget(page, name, candidates, data) {
  const resolved = await resolveAction(page, "connect", name, candidates, data);
  let primaryError;
  try {
    await clickVisible(page, resolved.handle, {
      ...interactionOptions(data),
      preferNative: resolved.context !== page,
    });
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    await disposeResolved(resolved, primaryError);
  }
}

async function openPrimaryConnectionDialog(page, data) {
  return activateConnectionTarget(page, "primary", selectors.primary, data);
}

async function openConnectionDialog(page, data) {
  try {
    return await openPrimaryConnectionDialog(page, data);
  } catch (error) {
    if (error.code !== "SELECTOR_NOT_FOUND") throw error;
    await clickAction(page, "connect", "moreActions", selectors.moreActions, data);
    return activateConnectionTarget(page, "menuItem", selectors.menuItem, data);
  }
}

async function verifyConnectionSuccess(page, url, data) {
  if (url && isCustomInviteHref(page.url())) {
    await navigateLinkedIn(page, url, data);
  }
  await assertAction(page, "connect", "success", selectors.success, data);
}

async function connect(page, cdp, data = {}) {
  const { url, message, confirm = false } = data;
  await navigateLinkedIn(page, url, data);

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
    await verifyConnectionSuccess(page, url, data);
    await transaction.complete();
    return { status: "sent", profileData };
  } catch (error) {
    await transaction.reject(error.code || "CONNECT_FAILED");
    throw error;
  }
}

module.exports = connect;
module.exports.isCustomInviteHref = isCustomInviteHref;
module.exports.openConnectionDialog = openConnectionDialog;
module.exports.verifyConnectionSuccess = verifyConnectionSuccess;
