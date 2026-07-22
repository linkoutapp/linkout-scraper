const LinkoutError = require("../errors/linkout-error");

async function send2FA() {
  throw new LinkoutError(
    "MANUAL_2FA_REQUIRED",
    "Complete verification manually in the visible local Chrome profile"
  );
}

module.exports = send2FA;
