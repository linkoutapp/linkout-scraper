const { scrapeActivityPage } = require("../helpers/scrape-activity");
const { activityPageUrl, canonicalProfileUrl } = require("./linkedin.posts");
const { activitySubject } = require("./linkedin.reactions");

function projectComments(row) {
  return (row.comments || []).map((comment) => ({
    name: String(comment.name || ""),
    comment: String(comment.text || ""),
    date: String(comment.date || ""),
    link: canonicalProfileUrl(comment.link),
  }));
}

async function comments(page, cdp, data = {}) {
  const { user, count = 5 } = data;
  const link = activityPageUrl(user, "comments");
  const rows = await scrapeActivityPage(page, { url: link, count });

  return {
    name: rows.map((row) => activitySubject(row.headerText)).find(Boolean) || "",
    link,
    values: rows.map((row) => ({
      url: row.url,
      comments: projectComments(row),
    })),
  };
}

module.exports = comments;
module.exports.projectComments = projectComments;
