async function scrapeFeedData(page) {
  await page.waitForSelector(".feed-identity-module__member-photo");

  await page.waitForSelector(
    "div.feed-identity-module__actor-meta a div.t-16.t-black.t-bold"
  );

  const profile = await page.$eval(
    ".feed-identity-module__member-photo",
    (img) => img.currentSrc
  );

  const profileName = await page.$eval(
    "div.feed-identity-module__actor-meta a div.t-16.t-black.t-bold",
    (element) => element.innerText
  );

  return { profile, profileName };
}

module.exports = scrapeFeedData;
