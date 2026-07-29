const createLinkedinUrl = require("../helpers/create.linkedin.url");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");
const selectors = require("../selectors/actions").like;
const {
  assertAction,
  clickAction,
  getActionPolicy,
} = require("./mutation-runtime");

async function like(page, cdp, data = {}) {
  const target = await createLinkedinUrl(data.url, 2);
  await navigateLinkedIn(page, target, data);
  const transaction = await getActionPolicy(cdp, data).begin({
    operation: "like",
    target,
    confirm: data.confirm === true,
    page,
  });

  try {
    await clickAction(page, "like", "button", selectors.button, data);
    await assertAction(page, "like", "success", selectors.success, data);
    await transaction.complete();
    return { status: "completed", url: target };
  } catch (error) {
    await transaction.reject(error.code || "LIKE_FAILED");
    throw error;
  }
}

module.exports = like;
