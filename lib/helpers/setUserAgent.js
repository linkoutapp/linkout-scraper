const LinkoutError = require("../errors/linkout-error");

async function setUserAgent() {
  throw new LinkoutError(
    "FINGERPRINT_OVERRIDE_REJECTED",
    "User-agent overrides are disabled; Linkout preserves visible Chrome's native fingerprint"
  );
}

module.exports = setUserAgent;
