const { findPageContext } = require("../helpers/find-page-context");
const selectors = require("../selectors/read-only");

function classifyConnectionStatus(signals) {
  const texts = Array.isArray(signals.texts) ? signals.texts : [];
  const labels = Array.isArray(signals.labels) ? signals.labels : [];
  const buttons = Array.isArray(signals.buttons) ? signals.buttons : [];

  if (texts.some((text) => /\b1st\b/i.test(text))) {
    return "Connected";
  }

  if ([...labels, ...buttons].some((text) => /\bpending\b/i.test(text))) {
    return "Pending";
  }

  return "Not connected";
}

async function connectionStatus(page, cdp, data) {
  const { user } = data;

  await page.goto(user);

  const context = await findPageContext(page, selectors.profile.root);
  if (!context) {
    return "Not connected";
  }

  const signals = await context.evaluate(() => {
    const primary = document.querySelector("main") || document;
    const textElements = Array.from(
      primary.querySelectorAll("p, span")
    ).slice(0, 250);
    const controls = Array.from(
      primary.querySelectorAll("button, a[aria-label], [role='button']")
    ).slice(0, 150);

    return {
      texts: textElements.map((element) =>
        String(element.textContent || "").trim()
      ),
      labels: controls.map((element) =>
        String(element.getAttribute("aria-label") || "").trim()
      ),
      buttons: controls.map((element) =>
        String(element.textContent || "").trim()
      ),
    };
  });

  return classifyConnectionStatus(signals);
}

module.exports = connectionStatus;
module.exports.classifyConnectionStatus = classifyConnectionStatus;
