const LinkoutError = require("../errors/linkout-error");

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const FORBIDDEN_OVERRIDE_KEYS = [
  "fingerprint",
  "userAgent",
  "locale",
  "timezone",
  "viewport",
];

function validateDevtoolsEndpoint(value, { allowRemote = false } = {}) {
  let endpoint;
  try {
    endpoint = new URL(String(value || ""));
  } catch (error) {
    throw new LinkoutError("INVALID_DEVTOOLS_ENDPOINT", "Invalid Chrome DevTools endpoint", {});
  }

  if (endpoint.protocol !== "http:") {
    throw new LinkoutError(
      "REMOTE_DEVTOOLS_REJECTED",
      "Chrome DevTools must use a loopback HTTP endpoint",
      { protocol: endpoint.protocol }
    );
  }
  if (!allowRemote && !LOOPBACK_HOSTS.has(endpoint.hostname)) {
    throw new LinkoutError(
      "REMOTE_DEVTOOLS_REJECTED",
      "Chrome DevTools must use a loopback endpoint",
      { hostname: endpoint.hostname }
    );
  }
  endpoint.username = "";
  endpoint.password = "";
  endpoint.search = "";
  endpoint.hash = "";
  return endpoint;
}

async function connectLocalChrome(options = {}) {
  const {
    browserURL = "http://127.0.0.1:9222",
    puppeteer = require("puppeteer"),
    platform = process.platform,
    allowRemote = false,
  } = options;

  if (platform !== "darwin") {
    throw new LinkoutError(
      "UNSUPPORTED_DEVICE",
      "This plugin is configured for the approved macOS device",
      { platform }
    );
  }

  const override = FORBIDDEN_OVERRIDE_KEYS.find((key) => options[key] !== undefined);
  if (override) {
    throw new LinkoutError(
      "FINGERPRINT_OVERRIDE_REJECTED",
      `Browser fingerprint override is not supported: ${override}`,
      { field: override }
    );
  }

  const endpoint = validateDevtoolsEndpoint(browserURL, { allowRemote });
  return puppeteer.connect({
    browserURL: endpoint.href,
    defaultViewport: null,
  });
}

module.exports = {
  connectLocalChrome,
  validateDevtoolsEndpoint,
};
