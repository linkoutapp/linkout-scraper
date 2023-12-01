const { timer, LinkedInErrors } = require("./linkedin.common.service");

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
    console.error(
      "An error occurred:",
      LinkedInErrors.INVALID_TOKEN_OR_INFINITE_LOADER
    );
  }
}

module.exports = login;
