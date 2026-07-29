const { findFirstSelector, findPageContext } = require("../helpers/find-page-context");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");
const selectors = require("../selectors/read-only");

function normalizeConnections(rows) {
  const connections = new Map();

  for (const row of rows) {
    try {
      const url = new URL(row.href, "https://www.linkedin.com");
      if (url.hostname !== "www.linkedin.com" || !url.pathname.startsWith("/in/")) {
        continue;
      }

      const name = String(row.name || "").trim().replace(/\s+/g, " ");
      const normalizedUrl = `https://www.linkedin.com${url.pathname}`;
      const existing = connections.get(url.pathname);

      if (!existing || (!existing.name && name)) {
        connections.set(url.pathname, { name, url: normalizedUrl });
      }
    } catch (_) {
      // Ignore malformed and non-HTTP profile links.
    }
  }

  return Array.from(connections.values()).filter((connection) => connection.name);
}

async function acceptedConnections(page) {
  await navigateLinkedIn(
    page,
    "https://www.linkedin.com/mynetwork/invite-connect/connections/"
  );

  const context = await findPageContext(page, selectors.connections.root);
  if (!context) {
    return [];
  }

  const selector = await findFirstSelector(
    context,
    selectors.connections.profileLinks
  );
  if (!selector) {
    return [];
  }

  const rows = await context.$$eval(selector, (links) =>
    links.map((link) => {
      const nameElement =
        link.querySelector("p") ||
        link.querySelector(".mn-connection-card__name");
      const image = link.querySelector("img");

      return {
        href: link.getAttribute("href") || "",
        name:
          (nameElement && nameElement.textContent) ||
          link.getAttribute("aria-label") ||
          (image && image.getAttribute("alt")) ||
          "",
      };
    })
  );

  return normalizeConnections(rows);
}

module.exports = acceptedConnections;
module.exports.normalizeConnections = normalizeConnections;
