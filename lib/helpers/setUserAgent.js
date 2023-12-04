// setUserAgent.js

async function setUserAgent(page, userAgent) {
  if (userAgent) {
    await page.setUserAgent(userAgent);
  }
}

module.exports = setUserAgent;
