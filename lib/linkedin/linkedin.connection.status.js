const { findPageContext } = require("../helpers/find-page-context");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");
const selectors = require("../selectors/read-only");

function classifyConnectionStatus(signals) {
  const texts = Array.isArray(signals.texts) ? signals.texts : [];
  const labels = Array.isArray(signals.labels) ? signals.labels : [];
  const buttons = Array.isArray(signals.buttons) ? signals.buttons : [];
  const controls = [...labels, ...buttons];

  if (controls.some((text) => /\bpending\b/i.test(text))) {
    return "Pending";
  }

  if (controls.some((text) => /\b(?:invite\b.*\bconnect|connect)\b/i.test(text))) {
    return "Not connected";
  }

  if (texts.some((text) => /\b1st\b/i.test(text))) {
    return "Connected";
  }

  return "Not connected";
}

async function connectionStatus(page, cdp, data) {
  const { user } = data;

  await navigateLinkedIn(page, user, data);

  const context = await findPageContext(page, selectors.profile.root);
  if (!context) {
    return "Not connected";
  }

  const signals = await context.evaluate(() => {
    const primary = document.querySelector("main") || document;
    const topCard = Array.from(
      primary.querySelectorAll('[data-view-name="profile-top-card"], section')
    ).find((section) => section.querySelector("h1, h2")) || primary;
    const textElements = Array.from(
      topCard.querySelectorAll("p, span")
    ).slice(0, 250);
    const controls = Array.from(
      topCard.querySelectorAll("button, a[aria-label], [role='button']")
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
