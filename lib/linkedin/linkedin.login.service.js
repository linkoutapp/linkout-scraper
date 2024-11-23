const { timer } = require("./linkedin.common.service");

async function login(page, cdp, data) {
  const { cookie } = data;

  try {
    await page.setCookie({
      name: "li_at",
      value: cookie,
      httpOnly: true,
      secure: true,
      sameSite: "None",
      priority: "Medium",
      path: "/",
      domain: ".linkedin.com",
    });

    await timer(3000);
    await page.goto("https://www.linkedin.com/feed/");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

module.exports = login;
