const express = require("express");
const bodyParser = require("body-parser");

const Linkout = require("../dist/linkedin.service");
const puppeteer = require("puppeteer-extra");
const dotenv = require("dotenv");

dotenv.config();

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

let browser;
let page;
let cdp;

app.post("/", async (req, res) => {
  try {
    browser = await puppeteer.launch({
      headless: false,
    });
    page = await browser.newPage();
    cdp = await page.target().createCDPSession();

    await page.setViewport({
      width: 1280,
      height: 800,
    });

    // add ghost-cursor for maximum safety
    await Linkout.tools.loadCursor(page, false);

    // remove webdriver detection
    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
    });

    await Linkout.tools.setUserAgent(page, process.env.USER_AGENT);

    const { token } = await Linkout.services.loginWithEmail(page, cdp, {
      user: process.env.EMAIL,
      password: process.env.PASSWORD,
    });

    await page.setCookie({
      name: "li_at",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "None",
      priority: "Medium",
      path: "/",
      domain: ".linkedin.com",
    });

    res.status(200).json({ message: "Logged-in successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/message", async (req, res) => {
  const { url, message } = req.body;

  try {
    await Linkout.services.message(page, cdp, {
      url: url,
      message: message,
    });

    res.status(200).json({ result: "Messaged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/messages", async (req, res) => {
  const { user, count = 20 } = req.body;

  try {
    const messages = await Linkout.services.messagesFromChat(page, cdp, {
      user: user,
      count: count,
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/reactions", async (req, res) => {
  const { user, count = 5 } = req.body;

  try {
    const reactions = await Linkout.services.reactions(page, cdp, {
      user: user,
      count: count,
    });

    res.status(200).json({ reactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/comments", async (req, res) => {
  const { user, count = 5 } = req.body;

  try {
    const comments = await Linkout.services.comments(page, cdp, {
      user: user,
      count: count,
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/post_with_comments", async (req, res) => {
  const { url, repostWithoutCaption } = req.body;

  try {
    const comments = await Linkout.services.postsWithComments(page, cdp, {
      url: url,
      repostWithoutCaption: repostWithoutCaption,
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/send2FA", async (req, res) => {
  const { code } = req.body;

  try {
    await Linkout.services.send2FA(page, cdp, {
      code: code,
    });

    res.status(200).json({ result: "2FA sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/connection_status", async (req, res) => {
  const { url } = req.body;

  try {
    const status = await Linkout.services.connectionStatus(page, cdp, {
      url: url,
    });

    res.status(200).json({ status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/posts", async (req, res) => {
  const { user, count = 5 } = req.body;

  try {
    const posts = await Linkout.services.posts(page, cdp, {
      user: user,
      count: count,
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// nodemon test.express.js
