module.exports = Object.freeze({
  profile: Object.freeze({
    root: ["main", '[role="main"]', "#profile-content"],
    name: ["main h2", '[role="main"] h2', "h1"],
    degree: [
      'main [class*="distance"]',
      '[aria-label*="degree connection"]',
      ".dist-value",
    ],
    pending: ['button[aria-label*="Pending"]', '[aria-label*="Pending"]'],
  }),
  connections: Object.freeze({
    root: ["main", '[role="main"]'],
    profileLinks: [
      'main a[href*="/in/"]',
      '[role="main"] a[href*="/in/"]',
      "ul .mn-connection-card a",
    ],
  }),
  messaging: Object.freeze({
    root: ["main", '[role="main"]'],
    conversation: [
      'main li:has(time):has(p):has(a[href*="/in/"])',
      '[role="main"] li:has(time):has(p):has(a[href*="/in/"])',
      ".msg-s-message-list__event",
    ],
    profileLink: [
      'a[href*="/in/"]',
      '[data-control-name="view_profile"]',
      ".msg-s-message-group__profile-link",
    ],
    message: ["p", "[data-event-urn] p"],
    time: ["time"],
  }),
  activity: Object.freeze({
    root: [
      ".pv-recent-activity-detail__core-rail",
      "main",
      '[role="main"]',
    ],
    cards: [".feed-shared-update-v2[data-urn]", '[role="article"][data-urn]'],
    postLinks: ['a[href*="/feed/update/"]', 'a[href*="/posts/"]'],
    actor: ['a[href*="/in/"]', ".update-components-actor__title"],
    time: [
      "time",
      ".update-components-actor__sub-description",
      ".update-components-actor__sub-description-link",
    ],
    text: ["p", ".update-components-text"],
  }),
});
