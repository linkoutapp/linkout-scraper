const LinkoutError = require("../errors/linkout-error");

async function loginWithEmail() {
  throw new LinkoutError(
    "MANUAL_LOGIN_REQUIRED",
    "Email/password automation is disabled; sign in manually in visible local Chrome"
  );
}

module.exports = loginWithEmail;
