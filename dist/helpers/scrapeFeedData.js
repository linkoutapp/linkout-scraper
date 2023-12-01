// scrapeFeedData.js

async function scrapeFeedData(page) {
  try {
    await page.waitForSelector(".feed-identity-module__member-photo");

    await page.waitForSelector("div.feed-identity-module__actor-meta a div.t-16.t-black.t-bold");

    profile = await page.$eval(".feed-identity-module__member-photo", img => img.currentSrc);

    profileName = await page.$eval("div.feed-identity-module__actor-meta a div.t-16.t-black.t-bold", element => element.innerText);

    return { profile, profileName };
  } catch (error) {
    // Handle the error or add logging
    console.error("Error in scrapeFeedData:", error);
    // Loading timeout or wrong token
  }
}

module.exports = scrapeFeedData;