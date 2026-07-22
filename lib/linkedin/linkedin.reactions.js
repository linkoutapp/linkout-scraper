const { scrapeActivityPage } = require("../helpers/scrape-activity");
const { activityPageUrl } = require("./linkedin.posts");

function reactionFromHeader(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("celebrat")) return "Celebrate";
  if (text.includes("support")) return "Support";
  if (text.includes("love")) return "Love";
  if (text.includes("insight")) return "Insightful";
  if (text.includes("funny")) return "Funny";
  if (text.includes("like")) return "Like";
  return "Unknown";
}

function activitySubject(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  const match = text.match(
    /^(.+?)\s+(?:likes?|liked|celebrates?|celebrated|supports?|supported|loves?|loved|finds?\s+this\s+insightful|found\s+this\s+insightful|thinks?\s+this\s+is\s+funny|commented|reposted)\b/i
  );
  return match ? match[1].trim() : "";
}

async function reactions(page, cdp, data = {}) {
  const { user, count = 5 } = data;
  const link = activityPageUrl(user, "reactions");
  const rows = await scrapeActivityPage(page, { url: link, count });

  return {
    name: rows.map((row) => activitySubject(row.headerText)).find(Boolean) || "",
    link,
    values: rows.map((row) => ({
      url: row.url,
      reaction: reactionFromHeader(row.headerText),
      date: row.date,
    })),
  };
}

module.exports = reactions;
module.exports.activitySubject = activitySubject;
module.exports.reactionFromHeader = reactionFromHeader;
