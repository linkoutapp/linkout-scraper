const { timer } = require("./linkedin.common.service");
const postsWithComments = require("./linkedin.posts.with.comments");

async function posts(page, cdp, data) {
  const { user, count = 2 } = data;

  try {
    await page.goto(user.endsWith("/") ? user + "recent-activity/all/" : user + "/recent-activity/all/");

    await page.waitForSelector(".pv-recent-activity-detail__core-rail");

    await timer(1000);

    await page.evaluate(async count => {
      function scrollIntoView() {
        document.querySelector(".pv-recent-activity-detail__core-rail").scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }

      for (let i = 0; i < Math.max(Math.ceil(count / 5), 0); i++) {
        scrollIntoView();

        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 1000));
      }
    }, count);

    await page.$eval(".pv-recent-activity-detail__core-rail", element => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    page.waitForSelector("div > div.feed-shared-control-menu.display-flex.feed-shared-update-v2__control-menu.absolute.text-align-right > div > button");

    const emberList = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div > div.feed-shared-control-menu.display-flex.feed-shared-update-v2__control-menu.absolute.text-align-right > div > button")).map(button => button.id);
    });

    const resultArray = emberList.length > count ? emberList.slice(0, count) : emberList;

    const hrefValues = [];

    for (const id of resultArray) {
      await page.cursor.click("#" + id);

      try {
        await page.waitForSelector(".artdeco-dropdown__content-inner", {
          timeout: 1000
        });
      } catch (error) {
        await page.evaluate(id => {
          document.querySelector("#" + id).click();
        }, id);
      }

      await timer(3000);

      await page.cursor.click("div > ul > li.feed-shared-control-menu__item.option-share-via");

      await page.waitForSelector("div > p > a");

      const hrefValue = await page.$eval("div > p > a", anchor => anchor.getAttribute("href"));

      const repost = await page.evaluate(id => {
        const element = document.querySelector("#" + id).parentNode.parentNode.parentNode.querySelector(".update-components-header__text-view");
        return element ? element.innerText : "";
      }, id);

      const date = await page.evaluate(id => {
        const element = document.querySelector("#" + id).parentNode.parentNode.parentNode.querySelector(".update-components-actor__sub-description-link");
        return element ? element.innerText.split(" ")[0].trim() : "";
      }, id);

      hrefValues.push({
        url: hrefValue,
        repostWithoutCaption: repost.includes("repost"),
        date: date
      });
    }

    let posts = [];

    for (const each of hrefValues) {
      let result = await postsWithComments(page, cdp, {
        url: each.url,
        repostWithoutCaption: each.repostWithoutCaption,
        date: each.date
      });
      posts.push(result);
      await timer(1000);
    }

    return posts;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = posts;