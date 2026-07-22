const { scrapeActivityPage } = require("../helpers/scrape-activity");

function activityPageUrl(user, section) {
  const base = String(user || "").replace(/\/+$/, "");
  return `${base}/recent-activity/${section}/`;
}

function canonicalProfileUrl(value) {
  try {
    const url = new URL(String(value || ""), "https://www.linkedin.com");
    if (url.hostname !== "www.linkedin.com" || !url.pathname.startsWith("/in/")) {
      return "";
    }
    return `https://www.linkedin.com${url.pathname}`;
  } catch (_) {
    return "";
  }
}

function projectPost(row, dateOverride) {
  const header = String(row.headerText || "");
  const isRepost = /\brepost(?:ed|s|ing)?\b/i.test(header);

  return {
    type: isRepost ? "repost" : "post",
    post: String(row.text || ""),
    link: String(row.url || ""),
    comments: (row.comments || []).map((comment) => ({
      name: String(comment.name || ""),
      comment: String(comment.text || ""),
      date: String(comment.date || ""),
      link: canonicalProfileUrl(comment.link),
    })),
    date: String(dateOverride || row.date || ""),
  };
}

async function posts(page, cdp, data = {}) {
  const { user, count = 2 } = data;
  const rows = await scrapeActivityPage(page, {
    url: activityPageUrl(user, "all"),
    count,
  });
  return rows.map((row) => projectPost(row));
}

module.exports = posts;
module.exports.activityPageUrl = activityPageUrl;
module.exports.canonicalProfileUrl = canonicalProfileUrl;
module.exports.projectPost = projectPost;
