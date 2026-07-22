const LinkoutError = require("../errors/linkout-error");

async function login() {
  throw new LinkoutError(
    "MANUAL_LOGIN_REQUIRED",
    "Sign in manually in the visible local Chrome profile, then connect Linkout to that browser"
  );
}

module.exports = login;
