module.exports = Object.freeze({
  connect: Object.freeze({
    primary: [
      'main button[aria-label*="Invite"][aria-label*="connect"]',
      'main button[aria-label^="Connect"]',
      'section.artdeco-card button[aria-label*="Invite"]',
    ],
    moreActions: [
      'main button[aria-label*="More actions"]',
      'section.artdeco-card button[aria-label*="More actions"]',
    ],
    menuItem: [
      '[role="menuitem"][aria-label*="connect"]',
      '[role="menu"] [aria-label*="to connect"]',
      'div[aria-label*="to connect"]',
    ],
    note: [
      'textarea[name="message"]',
      'textarea[aria-label*="note"]',
      'textarea[name*="message"]',
    ],
    addNote: [
      'button[aria-label*="Add a note"]',
      'button[aria-label*="personalize invitation"]',
    ],
    send: [
      'button[aria-label*="Send invitation"]:not(:disabled)',
      'button[aria-label*="Send without a note"]:not(:disabled)',
    ],
    success: [
      'main button[aria-label*="Pending"]',
      'main [aria-label*="invitation is pending"]',
    ],
  }),
  message: Object.freeze({
    open: [
      'main [data-view-name="profile-top-card"] a[href*="/messaging/compose/"][href*="recipient="]',
      'main section:has(h1) a[href*="/messaging/compose/"][href*="recipient="]',
      'main section:has(h2) a[href*="/messaging/compose/"][href*="recipient="]',
      '[role="main"] section:has(h1) a[href*="/messaging/compose/"][href*="recipient="]',
      '[role="main"] section:has(h2) a[href*="/messaging/compose/"][href*="recipient="]',
    ],
    composeRoot: [
      ".msg-overlay-conversation-bubble",
      '[role="dialog"]',
    ],
    editor: [
      '[role="textbox"][contenteditable="true"]',
      '.msg-form__contenteditable[contenteditable="true"]',
      '.msg-form__contenteditable',
    ],
    send: [
      'button[type="submit"][aria-label*="Send"]:not(:disabled)',
      '.msg-form__send-button:not(:disabled)',
    ],
  }),
  like: Object.freeze({
    button: [
      'button[aria-pressed="false"][aria-label*="Like"]',
      'button[aria-label*="React Like"]',
      'button:has(svg[data-test-icon*="thumbs"])',
    ],
    success: [
      'button[aria-pressed="true"][aria-label*="Like"]',
      'button[aria-label*="Remove Like"]',
    ],
  }),
  endorse: Object.freeze({
    button: [
      'main button[aria-label^="Endorse "]',
      '[data-view-name="profile-component-entity"] button[aria-label*="Endorse"]',
      'div[data-view-name="profile-component-entity"] button',
    ],
  }),
});
