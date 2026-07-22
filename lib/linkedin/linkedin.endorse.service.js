const createLinkedinUrl = require("../helpers/create.linkedin.url");
const selectors = require("../selectors/actions").endorse;
const {
  clickAction,
  getActionPolicy,
  resolveAction,
} = require("./mutation-runtime");

async function endorse(page, cdp, data = {}) {
  const target = await createLinkedinUrl(data.url, 3);
  await page.goto(target);
  const transaction = await getActionPolicy(cdp, data).begin({
    operation: "endorse",
    target,
    confirm: data.confirm === true,
    page,
  });

  try {
    await clickAction(page, "endorse", "button", selectors.button, data);
    await resolveAction(page, "endorse", "success", selectors.success, data);
    await transaction.complete();
    return { status: "completed", url: target };
  } catch (error) {
    await transaction.reject(error.code || "ENDORSE_FAILED");
    throw error;
  }
}

module.exports = endorse;
