const { timer } = require("./linkedin.common.service");

async function reactions(page, cdp, data) {
  const { user, count = 5 } = data;

  try {
    await page.goto(
      user.endsWith("/")
        ? user + "recent-activity/reactions/"
        : user + "/recent-activity/reactions/"
    );

    await page.waitForSelector(".pv-recent-activity-detail__core-rail");

    await page.evaluate(async (count) => {
      function scrollIntoView() {
        document
          .querySelector(".pv-recent-activity-detail__core-rail")
          .scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
      }

      for (let i = 0; i < Math.max(Math.ceil(count / 5), 0); i++) {
        scrollIntoView();

        await new Promise((resolve) =>
          setTimeout(resolve, Math.floor(Math.random() * 5000) + 1000)
        );
      }
    }, count);

    await page.$eval(".pv-recent-activity-detail__core-rail", (element) => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    page.waitForSelector(
      "div > div.feed-shared-control-menu.display-flex.feed-shared-update-v2__control-menu.absolute.text-align-right > div > button"
    );

    const emberList = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "div > div.feed-shared-control-menu.display-flex.feed-shared-update-v2__control-menu.absolute.text-align-right > div > button"
        )
      ).map((button) => button.id);
    });

    const resultArray =
      emberList.length > count ? emberList.slice(0, count) : emberList;

    const hrefValues = [];

    for (const id of resultArray) {
      await page.cursor.click("#" + id);

      try {
        await page.waitForSelector(".artdeco-dropdown__content-inner", {
          timeout: 1000,
        });
      } catch (error) {
        await page.evaluate((id) => {
          document.querySelector("#" + id).click();
        }, id);
      }

      await timer(3000);

      await page.cursor.click(
        "div > ul > li.feed-shared-control-menu__item.option-share-via"
      );

      await page.waitForSelector("div > p > a");

      const hrefValue = await page.$eval("div > p > a", (anchor) =>
        anchor.getAttribute("href")
      );

      hrefValues.push(hrefValue);
    }

    const reaction = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "div > div.update-components-header.update-components-header--with-control-menu.update-components-header--with-divider.update-components-header--with-image.t-12.t-black--light.t-normal.pt2 > div > span"
        )
      ).map((element) => {
        const textContent = element.textContent
          .trim()
          .split("\n")[0]
          .toLowerCase();

        if (textContent.includes("like")) {
          return "Like";
        } else if (textContent.includes("celebrate")) {
          return "Celebrate";
        } else if (textContent.includes("support")) {
          return "Support";
        } else if (textContent.includes("love")) {
          return "Love";
        } else if (textContent.includes("insight")) {
          return "Insightful";
        } else if (textContent.includes("funny")) {
          return "Funny";
        } else {
          return "Unknown";
        }
      });
    });

    const date = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "div > div.update-components-actor.display-flex > div > div > a.app-aware-link.update-components-actor__sub-description-link > span > span:nth-child(1)"
        )
      ).map((element) =>
        element.textContent.trim().split("\n")[0].split("•")[0].trim()
      );
    });

    const link = (await page.evaluate(() => window.location.href)) || "";

    const name = await page.evaluate(() => {
      const element = document.querySelector(
        "#recent-activity-top-card > div.break-words.ph5.pv0 > h3"
      );
      return element ? element.innerText.trim() : "";
    });

    const values = hrefValues.map((hrefValue, index) => ({
      url: hrefValue,
      reaction: reaction[index],
      date: date[index],
    }));

    return { name, link, values: values.length > 0 ? values : [] };
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = reactions;
