const DEFAULT_NAVIGATION_TIMEOUT = 60000;

function navigationTimeout(data = {}) {
  return data.navigationTimeout === undefined
    ? DEFAULT_NAVIGATION_TIMEOUT
    : data.navigationTimeout;
}

async function navigateLinkedIn(page, url, data = {}) {
  return page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: navigationTimeout(data),
  });
}

module.exports = {
  DEFAULT_NAVIGATION_TIMEOUT,
  navigateLinkedIn,
  navigationTimeout,
};
