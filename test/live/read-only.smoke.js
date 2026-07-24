const assert = require("node:assert/strict");
const test = require("node:test");

const Linkout = require("../..");

const enabled = process.env.LINKOUT_LIVE_READ_ONLY === "1";
const browserURL = process.env.LINKOUT_CHROME_URL || "http://127.0.0.1:9222";
const profileURL = process.env.LINKOUT_LIVE_PROFILE_URL || "";
const threadURL = process.env.LINKOUT_LIVE_THREAD_URL || "";

function requireLinkedInURL(value, expectedPath) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "www.linkedin.com");
  assert.match(url.pathname, expectedPath);
  return url.href;
}

async function requireHealthyPage(page, stage) {
  const state = await Linkout.tools.detectPageState(page);
  assert.equal(
    state.stop,
    false,
    `Stopped ${stage}: LinkedIn page state is ${state.state}`
  );
  assert.equal(state.state, "authenticated");
}

function activityURLFromResults(posts, reactions, comments) {
  const candidates = [
    ...(Array.isArray(posts) ? posts : []),
    ...((reactions && Array.isArray(reactions.values)) ? reactions.values : []),
    ...((comments && Array.isArray(comments.values)) ? comments.values : []),
  ];
  return candidates
    .map((candidate) => String(candidate.link || candidate.url || ""))
    .find((url) =>
      /^https:\/\/www\.linkedin\.com\/(?:feed\/update|posts)\//.test(url)
    );
}

test(
  "live read-only selectors match in visible local Chrome",
  { skip: !enabled },
  async () => {
    assert.equal(process.platform, "darwin", "Live checks require the configured macOS device");
    const endpoint = Linkout.tools.validateDevtoolsEndpoint
      ? Linkout.tools.validateDevtoolsEndpoint(browserURL)
      : new URL(browserURL);
    assert.match(endpoint.hostname, /^(127\.0\.0\.1|localhost|\[?::1\]?)$/);

    const approvedProfileURL = requireLinkedInURL(profileURL, /^\/in\/[^/]+\/?$/);
    const approvedThreadURL = requireLinkedInURL(
      threadURL,
      /^\/messaging\/thread\/[^/]+\/?$/
    );

    const browser = await Linkout.tools.connectLocalChrome({ browserURL });
    try {
      const pages = await browser.pages();
      const page = pages.find((candidate) => {
        try {
          return new URL(candidate.url()).hostname.endsWith("linkedin.com");
        } catch (_) {
          return false;
        }
      });
      assert.ok(page, "Open an authenticated LinkedIn tab in the visible Chrome session");
      await requireHealthyPage(page, "before the live checks");

      const profile = await Linkout.services.visit(page, null, {
        url: approvedProfileURL,
      });
      assert.ok(profile && profile.profileData);
      assert.ok(String(profile.profileData.fullName || "").trim());
      await requireHealthyPage(page, "after profile extraction");

      const status = await Linkout.services.connectionStatus(page, null, {
        user: approvedProfileURL,
      });
      assert.ok(["Connected", "Pending", "Not connected"].includes(status));
      await requireHealthyPage(page, "after connection-status extraction");

      const connections = await Linkout.services.acceptedConnections(page);
      assert.ok(Array.isArray(connections));
      await requireHealthyPage(page, "after connection-list extraction");

      const messages = await Linkout.services.messagesFromChat(page, null, {
        user: approvedThreadURL,
        count: 3,
        timeout: 10000,
      });
      assert.ok(messages && !messages.error, "The approved message thread did not match");
      assert.ok(Array.isArray(messages.values));
      await requireHealthyPage(page, "after message extraction");

      const posts = await Linkout.services.posts(page, null, {
        user: approvedProfileURL,
        count: 1,
      });
      assert.ok(Array.isArray(posts));
      await requireHealthyPage(page, "after post extraction");

      const reactions = await Linkout.services.reactions(page, null, {
        user: approvedProfileURL,
        count: 1,
      });
      assert.ok(reactions && Array.isArray(reactions.values));
      await requireHealthyPage(page, "after reaction extraction");

      const comments = await Linkout.services.comments(page, null, {
        user: approvedProfileURL,
        count: 1,
      });
      assert.ok(comments && Array.isArray(comments.values));
      await requireHealthyPage(page, "after comment extraction");

      const activityURL = activityURLFromResults(posts, reactions, comments);
      assert.ok(activityURL, "The approved profile has no readable activity URL");
      const approvedActivityURL = requireLinkedInURL(
        activityURL,
        /^\/(?:feed\/update|posts)\//
      );
      const postWithComments = await Linkout.services.postsWithComments(
        page,
        null,
        { url: approvedActivityURL }
      );
      assert.ok(postWithComments && Array.isArray(postWithComments.comments));
      await requireHealthyPage(page, "after post-with-comments extraction");
    } finally {
      await browser.disconnect();
    }
  }
);
