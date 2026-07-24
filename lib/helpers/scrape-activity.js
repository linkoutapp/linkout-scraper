const {
  findFirstSelector,
  waitForPageContext,
} = require("./find-page-context");
const selectors = require("../selectors/read-only");

function activityUrlFromRow(row) {
  const urn = String((row && row.urn) || "").trim();
  if (/^urn:li:(?:activity|share):\d+$/.test(urn)) {
    return `https://www.linkedin.com/feed/update/${urn}/`;
  }

  try {
    const url = new URL(String((row && row.url) || ""));
    if (
      url.protocol === "https:" &&
      url.hostname === "www.linkedin.com" &&
      (url.pathname.startsWith("/feed/update/") ||
        url.pathname.startsWith("/posts/"))
    ) {
      url.search = "";
      url.hash = "";
      return url.href;
    }
  } catch (_) {
    // A row without a canonical LinkedIn URL is ignored by normalization.
  }

  return "";
}

function normalizeActivityRows(rows, count) {
  const uniqueRows = [];
  const seen = new Set();

  for (const row of rows) {
    const url = activityUrlFromRow(row);
    const key = String(row.urn || url).trim();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueRows.push({ ...row, url });
  }

  if (!Number.isFinite(count) || count < 0) {
    return uniqueRows;
  }

  return count === 0 ? [] : uniqueRows.slice(0, count);
}

async function scrapeActivityPage(
  page,
  { url, count = 20, timeout = 10000 }
) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const context = await waitForPageContext(page, selectors.activity.cards, {
    timeout,
  });
  if (!context) {
    return [];
  }

  const selector = await findFirstSelector(context, selectors.activity.cards);
  if (!selector) {
    return [];
  }

  const rows = await context.$$eval(selector, (cards) => {
    const clean = (value) => String(value || "").trim().replace(/\s+/g, " ");

    return cards.map((card) => {
      const actorLink = card.querySelector('a[href*="/in/"]');
      const spanTexts = actorLink
        ? Array.from(actorLink.querySelectorAll("span"))
            .map((span) => clean(span.textContent))
            .filter((text) => text && !text.includes("•"))
        : [];
      const frequencies = spanTexts.reduce((counts, text) => {
        counts[text] = (counts[text] || 0) + 1;
        return counts;
      }, {});
      const actorName =
        spanTexts
          .filter((text) => frequencies[text] > 1)
          .sort((left, right) => left.length - right.length)[0] ||
        spanTexts.sort((left, right) => left.length - right.length)[0] ||
        "";
      const header = card.querySelector(".update-components-header__text-view");
      const date = card.querySelector(
        ".update-components-actor__sub-description, .update-components-actor__sub-description-link, time"
      );
      const text = card.querySelector(".update-components-text");
      const comments = Array.from(
        card.querySelectorAll(
          ".comments-comment-entity, .comments-comment-item, .comments-reply-item"
        )
      ).map((comment) => {
        const name = comment.querySelector(
          ".comments-comment-meta__description-title, .comments-post-meta__name-text"
        );
        const content = comment.querySelector(
          ".comments-comment-item__main-content, .comments-comment-item-content-body, .comments-reply-item-content-body"
        );
        const commentDate = comment.querySelector(
          "time.comments-comment-meta__data, time"
        );
        const profileLink = comment.querySelector('a[href*="/in/"]');

        return {
          name: clean(name && name.textContent),
          text: clean(content && content.textContent),
          date: clean(commentDate && commentDate.textContent),
          link: profileLink ? profileLink.getAttribute("href") || "" : "",
        };
      });

      return {
        urn: card.getAttribute("data-urn") || "",
        actorName,
        headerText: clean(header && header.textContent),
        date: clean(date && date.textContent),
        text: clean(text && text.textContent),
        comments,
      };
    });
  });

  return normalizeActivityRows(rows, count);
}

module.exports = {
  activityUrlFromRow,
  normalizeActivityRows,
  scrapeActivityPage,
};
