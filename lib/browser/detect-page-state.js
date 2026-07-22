function classifyPageState(snapshot = {}) {
  const url = String(snapshot.url || "").toLowerCase();
  const text = String(snapshot.text || "").toLowerCase();

  if (/automated activity|temporarily restricted|account restricted/.test(text)) {
    return { state: "automation-warning", stop: true };
  }
  if (/captcha|i am not a robot|security characters/.test(text)) {
    return { state: "captcha", stop: true };
  }
  if (url.includes("/checkpoint/") || /security verification|verify your identity/.test(text)) {
    return { state: "checkpoint", stop: true };
  }
  if (url.includes("/login") || url.includes("/uas/login")) {
    return { state: "login", stop: true };
  }
  if (snapshot.unexpectedModal) {
    return { state: "unexpected-modal", stop: true };
  }
  if (snapshot.hasAuthenticatedUi) {
    return { state: "authenticated", stop: false };
  }
  return { state: "unknown", stop: true };
}

async function detectPageState(page) {
  const url = await page.url();
  const snapshot = await page.evaluate(() => {
    const root = document.querySelector("main") || document.body;
    const text = String((root && root.innerText) || "").slice(0, 20000);
    const hasAuthenticatedUi = Boolean(
      document.querySelector(
        'a[href^="/feed/"], input[placeholder*="Search"], nav[aria-label*="Primary"]'
      )
    );
    const unexpectedModal = Array.from(
      document.querySelectorAll('[role="dialog"][aria-modal="true"]')
    ).some((dialog) => {
      const value = String(dialog.textContent || "").toLowerCase();
      return !/messag|conversation|connection request|add a note/.test(value);
    });

    return { text, hasAuthenticatedUi, unexpectedModal };
  });

  return classifyPageState({ ...snapshot, url });
}

module.exports = {
  classifyPageState,
  detectPageState,
};
