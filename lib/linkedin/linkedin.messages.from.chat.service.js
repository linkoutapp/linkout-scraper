const { timer } = require("./linkedin.common.service");

function extractUserName(linkedinProfileUrl) {
  const regex = /\/in\/([^\/?]+)/;
  const match = linkedinProfileUrl.match(regex);
  return match ? match[1].toLowerCase() : null;
}

let prevTop = "";

async function getMessagesList(page) {
  try {
    await page.waitForFunction(
      () => {
        const element = document.querySelector(".artdeco-pill__text");
        return element && element.textContent.trim() !== "";
      },
      { timeout: 10000 }
    );
  } catch (err) {
    // Handle the error here
  }

  try {
    await page.waitForFunction(
      () => {
        const element = document.querySelector(
          ".profile-card-one-to-one__profile-link"
        );
        return element && element.innerText.trim() !== "";
      },
      { timeout: 10000 }
    );
  } catch (err) {
    // Handle the error here
  }

  await page.waitForSelector(".msg-s-message-list__loader.hidden");

  const getName = await page.evaluate(() => {
    const pillTextElement = document.querySelector(".artdeco-pill__text");
    const profileLinkElement = document.querySelector(
      ".profile-card-one-to-one__profile-link"
    );

    if (pillTextElement && pillTextElement.textContent.trim()) {
      return pillTextElement.textContent.trim();
    } else if (profileLinkElement && profileLinkElement.innerText.trim()) {
      return profileLinkElement.innerText.trim();
    } else {
      return "Prospect";
    }
  });

  const img =
    (await page.evaluate((n) => {
      return (Array.from(document.querySelectorAll("h3")) || [])
        .find((f) => f.innerText.trim().indexOf(n) > -1)
        .closest("li")
        .querySelector("img")
        .getAttribute("src");
    }, getName)) || "";

  const link = await page.evaluate(() => {
    return window.location.href;
  });

  await timer(3000);

  const a = {
    name: getName,
    img,
    link,
    values: await page.evaluate((theName) => {
      return (
        Array.from(document.querySelectorAll(".msg-s-message-list__event")) ||
        []
      ).reduce((all, current) => {
        const topElement = current.querySelector(
          '[data-control-name="view_profile"], .msg-s-message-group__profile-link'
        );
        const top = topElement ? topElement.textContent.trim() : "";

        const timeElement = Array.from(current.querySelectorAll("time")).find(
          (m) => m.innerText.includes(":")
        );
        const time = timeElement ? timeElement.innerText.trim() : "";

        const from = top || prevTop;

        all.push({
          time,
          from,
          message: "",
        });

        if (top) {
          prevTop = top;
        }

        const messageElement = current.querySelector("[data-event-urn] p");
        const message = messageElement ? messageElement.textContent.trim() : "";

        all[all.length - 1] = Object.assign({}, all[all.length - 1], {
          message: (" " + message).trim(),
        });

        return all;
      }, []);
    }, getName),
  };

  return a;
}

async function messagesFromChat(page, cdp, data) {
  const { user, count = 20 } = data;

  const userName = extractUserName(user);
  try {
    await page.goto(
      "https://www.linkedin.com/messaging/compose/?connId=" + userName
    );

    try {
      await page.waitForSelector(".msg-s-message-list-content");
    } catch (_) {
      // no messages
      return { error: "No messages found on the page." };
    }

    await timer(3000);

    for (let i = 0; i < Math.max(Math.ceil(count / 20) - 1, 0); i++) {
      await page.evaluate(() => {
        document
          .querySelector(".msg-s-message-list-content")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      });

      await timer(3000);
    }

    return await getMessagesList(page);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = messagesFromChat;
