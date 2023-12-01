// create.linkedin.url.js

async function createLinkedinUrl(getUrl, type) {
  switch (type) {
    case 1:
      if (getUrl && getUrl.includes("/mynetwork/invite-connect/connections/")) {
        return "https://www.linkedin.com" + getUrl;
      }
      break;

    case 2:
      if (getUrl && getUrl.includes("/in")) {
        return getUrl.endsWith("/") ? getUrl + "recent-activity/all/" : getUrl + "/recent-activity/all/";
      }
      break;

    case 3:
      if (getUrl && getUrl.includes("/in")) {
        return getUrl.endsWith("/") ? getUrl + "details/skills/" : getUrl + "/details/skills/";
      }
      break;

    default:
      return null;
  }
}

module.exports = createLinkedinUrl;