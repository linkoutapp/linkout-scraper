const { timer } = require("./linkedin.common.service");

async function comments(page, cdp, data) {
  const { user, count = 5 } = data;

  try {
    await page.goto(
      user.endsWith("/")
        ? user + "recent-activity/comments/"
        : user + "/recent-activity/comments/"
    );

    await page.waitForSelector(".pv-recent-activity-detail__core-rail");

    await timer(1000);

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

    const link = (await page.evaluate(() => window.location.href)) || "";

    const name = await page.evaluate(() => {
      const element = document.querySelector(
        "#recent-activity-top-card > div.break-words.ph5.pv0 > h3"
      );
      return element ? element.innerText.trim() : "";
    });

    const commentsAndDates = await page.evaluate(() => {
      const commentElements = document.querySelectorAll(
        "div:nth-child(1) > article.comments-comment-item--highlighted"
      );

      return Array.from(commentElements, (commentElement) => {
        const id = commentElement.id;

        const dates = document.querySelectorAll(`#${id} time`);

        console.log("dates", dates, JSON.stringify(dates));

        const commentNames = document.querySelectorAll(
          `#${id} .comments-post-meta__name-text`
        );
        const comments = document.querySelectorAll(
          `#${id} .comments-comment-item__main-content`
        );

        const combinedComments = [];
        for (
          let i = 0;
          i < Math.min(commentNames.length, comments.length);
          i++
        ) {
          const name = commentNames[i].innerText.split("\n")[0].trim() || "";
          const comment = comments[i].innerText.split("\n")[0].trim() || "";
          const date = dates[i].innerText.split("\n")[0].trim() || "";

          console.log(commentNames[i], comments[i], dates[i], date);
          combinedComments.push({ name, comment, date });
        }

        console.log("combinedComments", combinedComments);
        return {
          comments: combinedComments,
        };
      });
    });

    const values = hrefValues.map((hrefValue, index) => ({
      url: hrefValue,
      comments: commentsAndDates[index].comments,
    }));

    return { name, link, values: values.length > 0 ? values : [] };
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = comments;
