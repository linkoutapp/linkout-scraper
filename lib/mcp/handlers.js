const LinkoutError = require("../errors/linkout-error");

function validateLinkedInUrl(value, allowedPrefixes) {
  try {
    const url = new URL(String(value || ""));
    if (
      url.protocol !== "https:" ||
      url.hostname !== "www.linkedin.com" ||
      !allowedPrefixes.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      throw new Error("not allowed");
    }
    return `${url.origin}${url.pathname}`;
  } catch (_) {
    throw new LinkoutError(
      "INVALID_LINKEDIN_URL",
      "Expected an HTTPS www.linkedin.com URL for this read-only tool"
    );
  }
}

function boundedCount(value, fallback = 20) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new LinkoutError("INVALID_COUNT", "count must be an integer from 0 through 100");
  }
  return value;
}

function success(result) {
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    structuredContent: { result },
  };
}

function failure(error) {
  const code = error && error.code ? error.code : "READ_FAILED";
  const message = error instanceof LinkoutError
    ? error.message
    : "The read-only LinkedIn operation failed";
  return {
    isError: true,
    content: [{ type: "text", text: `${code}: ${message}` }],
    structuredContent: { error: { code, message } },
  };
}

async function assertReadablePage(page, detectState) {
  if (typeof detectState !== "function") return;
  const state = await detectState(page);
  if (state && state.stop) {
    throw new LinkoutError(
      "PAGE_STATE_STOP",
      `LinkedIn read stopped: ${state.state}`,
      { state: state.state }
    );
  }
}

function createHandlers({ services, pageProvider, detectState }) {
  async function call(serviceName, data, transform = (value) => value) {
    try {
      const service = services[serviceName];
      if (typeof service !== "function") {
        throw new LinkoutError("SERVICE_UNAVAILABLE", "The requested read service is unavailable");
      }
      const page = await pageProvider();
      await assertReadablePage(page, detectState);
      const result = await service(page, null, data);
      await assertReadablePage(page, detectState);
      return success(transform(result));
    } catch (error) {
      return failure(error);
    }
  }

  return {
    linkedin_get_profile: ({ url }) =>
      call("visit", { url: validateLinkedInUrl(url, ["/in/"]) }),
    linkedin_get_connection_status: ({ url }) =>
      call("connectionStatus", { user: validateLinkedInUrl(url, ["/in/"]) }),
    linkedin_list_connections: ({ count } = {}) => {
      const limit = boundedCount(count);
      return call("acceptedConnections", {}, (rows) =>
        Array.isArray(rows) ? rows.slice(0, limit) : rows
      );
    },
    linkedin_read_message_thread: ({ threadUrl, profileUrl, count }) =>
      call("messagesFromChat", {
        user: validateLinkedInUrl(threadUrl, ["/messaging/thread/"]),
        ...(profileUrl
          ? { profileUrl: validateLinkedInUrl(profileUrl, ["/in/"]) }
          : {}),
        count: boundedCount(count),
      }),
    linkedin_list_posts: ({ profileUrl, count }) =>
      call("posts", {
        user: validateLinkedInUrl(profileUrl, ["/in/"]),
        count: boundedCount(count),
      }),
    linkedin_list_reactions: ({ profileUrl, count }) =>
      call("reactions", {
        user: validateLinkedInUrl(profileUrl, ["/in/"]),
        count: boundedCount(count),
      }),
    linkedin_list_comments: ({ profileUrl, count }) =>
      call("comments", {
        user: validateLinkedInUrl(profileUrl, ["/in/"]),
        count: boundedCount(count),
      }),
    linkedin_list_posts_with_comments: ({ activityUrl }) =>
      call("postsWithComments", {
        url: validateLinkedInUrl(activityUrl, ["/feed/update/", "/posts/"]),
      }),
  };
}

module.exports = {
  assertReadablePage,
  boundedCount,
  createHandlers,
  failure,
  success,
  validateLinkedInUrl,
};
