// waitForLoader.js
const timer = require("./timer");

async function waitForLoader(page) {
  try {
    await page.waitForSelector(".initial-load-animation.fade-load", {
      timeout: 0
    });
  } catch (err) {}
  await timer(3000);
}

module.exports = waitForLoader;