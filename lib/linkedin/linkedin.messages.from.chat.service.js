const {
  findFirstSelector,
  waitForPageContext,
} = require("../helpers/find-page-context");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");
const selectors = require("../selectors/read-only");

function extractUserName(linkedinProfileUrl) {
  const match = String(linkedinProfileUrl || "").match(/\/in\/([^/?]+)/);
  return match ? match[1].toLowerCase() : null;
}

function normalizeMessageRows(rows, count) {
  let previousSender = "";

  const values = rows.reduce((messages, row) => {
    const profileNames = (row.profileNames || [])
      .map((name) => String(name || "").trim().replace(/\s+/g, " "))
      .filter(Boolean);
    const sender =
      [...profileNames]
        .reverse()
        .find((name) => !/^view .+ profile$/i.test(name)) || previousSender;
    const times = (row.times || []).map((time) => String(time || "").trim());
    const message = (row.paragraphs || [])
      .map((paragraph) => String(paragraph || "").trim())
      .find(Boolean);

    if (sender) {
      previousSender = sender;
    }

    if (message) {
      messages.push({
        time: times.filter(Boolean).at(-1) || "",
        from: sender || "",
        message,
      });
    }

    return messages;
  }, []);

  if (!Number.isFinite(count) || count < 0) {
    return values;
  }

  return count === 0 ? [] : values.slice(-count);
}

async function extractMessageRows(context, selector) {
  return context.$$eval(selector, (messageRows) =>
    messageRows.map((row) => ({
      times: Array.from(row.querySelectorAll("time")).map(
        (time) => time.textContent || ""
      ),
      profileNames: Array.from(
        row.querySelectorAll('a[href*="/in/"]')
      ).map((link) => link.textContent || link.getAttribute("aria-label") || ""),
      paragraphs: Array.from(row.querySelectorAll("p")).map(
        (paragraph) => paragraph.textContent || ""
      ),
    }))
  );
}

async function waitForMessageRows(
  context,
  selector,
  { count, timeout, interval = 250, stableRounds = 6 }
) {
  if (count === 0) return [];

  const deadline = Date.now() + Math.max(0, timeout);
  const desiredCount = Number.isFinite(count) && count > 0
    ? Math.floor(count)
    : 0;
  let previousLength = -1;
  let stable = 0;
  let rows = [];

  do {
    rows = await extractMessageRows(context, selector);
    const available = normalizeMessageRows(rows, count).length;
    if (desiredCount > 0 && available >= desiredCount) return rows;

    if (rows.length === previousLength) {
      stable += 1;
      if (desiredCount === 0 && stable >= stableRounds) return rows;
    } else {
      previousLength = rows.length;
      stable = 0;
    }

    if (Date.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, interval)));
  } while (Date.now() <= deadline);

  return rows;
}

async function messagesFromChat(page, cdp, data) {
  const {
    user,
    count = 20,
    timeout = 10000,
    pollInterval = 250,
  } = data;
  const userName = extractUserName(user);
  const destination = String(user).includes("/messaging/thread/")
    ? user
    : `https://www.linkedin.com/messaging/compose/?connId=${userName}`;

  await navigateLinkedIn(page, destination, data);

  const rootContext = await waitForPageContext(
    page,
    selectors.messaging.root,
    { timeout }
  );
  if (!rootContext) {
    return { error: "No messages found on the page." };
  }

  const messageContext =
    (await waitForPageContext(page, selectors.messaging.conversation, {
      timeout,
    })) || rootContext;
  const conversationSelector = await findFirstSelector(
    messageContext,
    selectors.messaging.conversation
  );

  const rows = conversationSelector
    ? await waitForMessageRows(messageContext, conversationSelector, {
        count,
        timeout,
        interval: pollInterval,
      })
    : [];

  const header = await messageContext.evaluate(() => {
    const primary = document.querySelector("main") || document;
    const profileLink = Array.from(
      primary.querySelectorAll('a[href*="/in/"]')
    ).find((link) => link.querySelector("h2"));
    const nameElement = profileLink && profileLink.querySelector("h2");
    const image = profileLink && profileLink.querySelector("img");

    return {
      name: nameElement ? String(nameElement.textContent || "").trim() : "",
      img: image ? image.getAttribute("src") || "" : "",
    };
  });
  const values = normalizeMessageRows(rows, count);
  const link = typeof page.url === "function" ? await page.url() : destination;

  return {
    name: header.name || (values[0] && values[0].from) || "Prospect",
    img: header.img || "",
    link,
    values,
  };
}

module.exports = messagesFromChat;
module.exports.extractMessageRows = extractMessageRows;
module.exports.extractUserName = extractUserName;
module.exports.normalizeMessageRows = normalizeMessageRows;
module.exports.waitForMessageRows = waitForMessageRows;
