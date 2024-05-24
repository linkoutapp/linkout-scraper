const { timer } = require("./linkedin.common.service");

async function scrollAndLoad(page) {
  await page.evaluate(async () => {
    function scrollIntoView() {
      document.querySelector(".feed-shared-update-v2").scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    function loadMoreComments() {
      document
        .querySelector(".comments-comments-list__load-more-comments-button")
        .click();
    }

    function isLoadMorePresent() {
      return (
        document.querySelector(
          ".comments-comments-list__load-more-comments-button"
        ) !== null
      );
    }

    function runAandB() {
      scrollIntoView();

      if (isLoadMorePresent()) {
        loadMoreComments();
      }
    }

    async function runAandBRepeatedly() {
      return new Promise((resolve) => {
        const intervalId = setInterval(() => {
          runAandB();

          if (!isLoadMorePresent()) {
            clearInterval(intervalId);
            resolve();
          }
        }, 3000 + Math.floor(Math.random() * (1000 - 1000 + 1) + 1000));
      });
    }

    runAandB();

    if (isLoadMorePresent()) {
      await runAandBRepeatedly();
    }
  });
}

async function postsWithComments(page, cdp, data) {
  const { url, repostWithoutCaption = false, date } = data;

  try {
    await page.goto(url);

    await page.waitForSelector(".feed-shared-update-v2");

    await timer(1000);

    // repostWithoutCaption
    if (repostWithoutCaption) {
      let a = await page.evaluate(() => {
        try {
          const postContentElement = document.querySelector(
            "div > div.feed-shared-update-v2__description-wrapper.mr2 > div > div > span > span"
          );
          const postContent = postContentElement
            ? postContentElement.innerText.trim()
            : "";

          return {
            type: "repost",
            post: postContent,
            link: "https://www.linkedin.com" + window.location.pathname,
          };
        } catch (error) {
          console.error("An error occurred:", error);
          return { error: "An error occurred while evaluating the page" };
        }
      });

      a.date = date;

      return (
        a || {
          link: window.location.href,
          comments: [],
        }
      );
    }

    await scrollAndLoad(page);

    // repostWithCaption || post
    const scrapedData = await page.evaluate(() => {
      const postElement = document.querySelector(
        "div > div.feed-shared-update-v2__description-wrapper.mr2 > div > div > span > span"
      );
      const post = postElement ? postElement.innerText.trim() : "";

      const repostCaptionElement = document.querySelector(
        "[class*=update-content-wrapper] .update-components-text"
      );

      const repostCaption = repostCaptionElement
        ? repostCaptionElement.innerText
        : "";

      const type = repostCaption.length > 0 ? "repostWithCaption" : "post";

      const link = "https://www.linkedin.com" + window.location.pathname;

      const comments = Array.from(
        document.querySelectorAll(".comments-post-meta__name-text")
      ).map((nameElement) => {
        const name = nameElement.innerText.trim().split("\n")[0];
        const linkElement = nameElement.closest("a");
        let link = "https://www.linkedin.com";

        if (linkElement) {
            const url = new URL(linkElement.getAttribute("href"), "https://www.linkedin.com");
            link = url.href;
        }

        const commentElement = nameElement.closest(
          ".comments-comment-item, .comments-reply-item"
        );
        let comment = "";
        if (commentElement) {
          const commentContentElement = commentElement.querySelector(
            ".comments-comment-item-content-body, .comments-reply-item-content-body"
          );
          if (commentContentElement) {
            const commentContent = commentContentElement.textContent
              .trim()
              .split("\n");
            comment = commentContent[0] || "";
          }
        }

        return { name, link, comment };
      });

      const scrapedData = { type, post, link, comments };

      if (repostCaption) {
        scrapedData.repostCaption = repostCaption;
      }

      return scrapedData;
    });

    scrapedData.date = date;

    return scrapedData || { link: "", comments: [] };
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = postsWithComments;
