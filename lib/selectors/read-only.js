module.exports = Object.freeze({
  profile: Object.freeze({
    root: ["main", '[role="main"]', "#profile-content"],
    name: ["main h2", '[role="main"] h2', "h1"],
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
  }),
  activity: Object.freeze({
    cards: [".feed-shared-update-v2[data-urn]", '[role="article"][data-urn]'],
  }),
});
