const { createLinkedinUrl } = require("./linkedin.common.service");

async function acceptedConnections(page, cdp) {
  try {
    const url = await createLinkedinUrl(
      "/mynetwork/invite-connect/connections/",
      1
    );

    await page.goto(url);

    try {
      await page.waitForSelector(".mn-connection-card__details", {
        timeout: 10000,
      });

      return (await scrapeProfile(page)).map((m) => ({
        name: m.name,
        url: m.url,
      }));
    } catch (err) {
      return [];
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

async function scrapeProfile(page) {
  return page.evaluate(async () => {
    return Array.from(document.querySelectorAll("ul .mn-connection-card")).map(
      (elm) => ({
        name: elm.querySelector(".mn-connection-card__name")
          ? elm.querySelector(".mn-connection-card__name").textContent.trim()
          : "",
        url: elm.querySelector("a")
          ? elm.querySelector("a").getAttribute("href")
          : "",
      })
    );
  });
}

module.exports = acceptedConnections;
