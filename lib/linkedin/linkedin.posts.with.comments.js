const { scrapeActivityPage } = require("../helpers/scrape-activity");
const { projectPost } = require("./linkedin.posts");

async function postsWithComments(page, cdp, data = {}) {
  const { url, date } = data;
  const rows = await scrapeActivityPage(page, { url, count: 1 });
  return rows[0] ? projectPost(rows[0], date) : { link: String(url || ""), comments: [] };
}

module.exports = postsWithComments;
