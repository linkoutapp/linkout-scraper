const test = require("node:test");
const assert = require("node:assert/strict");

const connect = require("../../lib/linkedin/linkedin.connect.service");
const message = require("../../lib/linkedin/linkedin.message.service");
const { waitForMessageSent } = message;
const like = require("../../lib/linkedin/linkedin.like.service");
const endorse = require("../../lib/linkedin/linkedin.endorse.service");
const { waitForEndorsement } = endorse;
const { typeAction } = require("../../lib/linkedin/mutation-runtime");

function element(text = "") {
  return {
    async evaluate(callback) {
      return callback({ textContent: text });
    },
    async boundingBox() {
      return { x: 1, y: 2, width: 10, height: 10 };
    },
  };
}

function linkElement({ text = "", href = "" } = {}) {
  return {
    async evaluate(callback) {
      return callback({
        textContent: text,
        href,
        getAttribute(name) {
          return name === "href" ? href : null;
        },
      });
    },
    async boundingBox() {
      return { x: 1, y: 2, width: 10, height: 10 };
    },
    async onClick(page) {
      page.currentUrl = href;
    },
  };
}

function endorsementControl(skill, { transition = true } = {}) {
  let label = `Endorse ${skill}`;
  return {
    async evaluate(callback) {
      return callback({
        getAttribute(name) {
          if (name === "aria-label") return label;
          if (name === "aria-pressed") return "false";
          return null;
        },
      });
    },
    async boundingBox() {
      return { x: 1, y: 2, width: 10, height: 10 };
    },
    async onClick() {
      if (transition) label = `Endorsed ${skill}`;
    },
  };
}

function profileMessageElement({ fullName, href, headingLevel = "h1" }) {
  return {
    async evaluate(callback) {
      const card = {
        querySelector(selector) {
          return selector.split(",").includes(headingLevel)
            ? { textContent: fullName }
            : null;
        },
      };
      return callback({
        href,
        getAttribute(name) {
          return name === "href" ? href : null;
        },
        closest() {
          return card;
        },
      });
    },
    async boundingBox() {
      return { x: 1, y: 2, width: 10, height: 10 };
    },
  };
}

function composeControl(label, calls, x = 1) {
  return {
    label,
    async focus() {
      calls.push(["control-focus", label]);
    },
    async boundingBox() {
      return { x, y: 2, width: 10, height: 10 };
    },
  };
}

function composeRoot({
  profilePath,
  recipient,
  editor,
  send,
  sendMisses = 0,
  sentState,
  decoyProfilePaths = [],
  decoyRecipientIds = [],
}) {
  let remainingSendMisses = sendMisses;
  const controls = (selector) => {
    const isSend = selector.includes("Send") || selector.includes("send-button");
    if (isSend && remainingSendMisses > 0) {
      remainingSendMisses -= 1;
      return [];
    }
    const value = selector.includes("contenteditable")
      ? editor
      : isSend
        ? send
        : null;
    return Array.isArray(value) ? value : value ? [value] : [];
  };
  return {
    async $(selector) {
      return controls(selector)[0] || null;
    },
    async $$(selector) {
      return controls(selector);
    },
    async evaluate(_callback, argument) {
      if (typeof argument === "string") {
        return sentState || { editorText: "", lastMessage: "" };
      }
      return {
        visible: true,
        profilePaths: [...(profilePath ? [profilePath] : []), ...decoyProfilePaths],
        recipientIds: [...(recipient ? [recipient] : []), ...decoyRecipientIds],
        pathMatch:
          profilePath === argument.path || decoyProfilePaths.includes(argument.path),
        recipientMatch:
          recipient === argument.recipient || decoyRecipientIds.includes(argument.recipient),
        headerPathMatch: profilePath === argument.path,
        headerRecipientMatch: recipient === argument.recipient,
        ready: true,
      };
    },
  };
}

function messagingFrame(root) {
  return {
    url() {
      return "https://www.linkedin.com/messaging/preload/";
    },
    async $(selector) {
      if (selector === "body") return root;
      return root.$(selector);
    },
    async $$(selector) {
      return selector === "body" ? [root] : [];
    },
    async evaluate(_callback, argument) {
      if (typeof argument === "string") return root.evaluate(null, argument);
      const details = await root.evaluate(null, argument);
      return {
        verified:
          details.profilePaths.includes(argument.path) ||
          details.recipientIds.includes(argument.recipient),
        signal: "test-frame",
      };
    },
    async focus(selector) {
      const control = await root.$(selector);
      if (control) await control.focus();
    },
  };
}

test("compose recipient is ready before typing when its send button is disabled", async () => {
  const visible = { getClientRects: () => [{}] };
  const disabledSend = { ...visible, disabled: true };
  const root = {
    async evaluate(callback, argument) {
      return callback({
        getClientRects: visible.getClientRects,
        querySelectorAll(selector) {
          if (selector.includes("contenteditable")) return [visible];
          if (selector.includes("send-button")) {
            return selector.includes(":not(:disabled)") ? [] : [disabledSend];
          }
          return [];
        },
      }, argument);
    },
  };

  const details = await message.inspectComposeRoot(
    root,
    "/in/shrinivaasan/",
    "recipient-id"
  );

  assert.equal(details.ready, true);
});

function mutationPage(selectors = {}) {
  const calls = [];
  const page = {
    calls,
    frameList: [],
    frames: () => page.frameList,
    url: () => page.currentUrl || "https://www.linkedin.com/feed/",
    async goto(url, options) {
      calls.push(["goto", url, options]);
      page.currentUrl = url;
    },
    async $(selector) {
      calls.push(["query", selector]);
      return selectors[selector] || null;
    },
    async $$(selector) {
      const match = selectors[selector];
      if (Array.isArray(match)) return match;
      return match ? [match] : [];
    },
    async evaluate() {
      return {
        text: "Home My Network",
        hasAuthenticatedUi: true,
        unexpectedModal: false,
      };
    },
    async focus(selector) {
      calls.push(["focus", selector]);
    },
    keyboard: {
      async down(value) {
        calls.push(["down", value]);
      },
      async press(value) {
        calls.push(["press", value]);
      },
      async up(value) {
        calls.push(["up", value]);
      },
      async type(value) {
        calls.push(["type", value]);
      },
    },
    cursor: {
      async click(target) {
        calls.push(["click", target]);
        if (target && typeof target.onClick === "function") {
          await target.onClick(page);
        }
      },
    },
    mouse: {
      async move() {},
      async click(x, y) {
        calls.push(["native-click", x, y]);
      },
    },
  };
  return page;
}

function recordingPolicy() {
  const calls = [];
  return {
    calls,
    async begin(input) {
      calls.push(["begin", input.operation, input.confirm, input.target]);
      if (!input.confirm) {
        const error = new Error("confirmation required");
        error.code = "CONFIRMATION_REQUIRED";
        throw error;
      }
      return {
        async complete() {
          calls.push(["complete", input.operation]);
        },
        async reject(code) {
          calls.push(["reject", input.operation, code]);
        },
      };
    },
  };
}

test("typeAction focuses the exact visible handle selected after hidden duplicates", async () => {
  const calls = [];
  const hidden = {
    async isVisible() {
      return false;
    },
    async dispose() {
      calls.push(["dispose", "hidden"]);
    },
  };
  const visible = {
    async isVisible() {
      return true;
    },
    async isIntersectingViewport() {
      return true;
    },
    async focus() {
      calls.push(["focus", "visible"]);
    },
    async dispose() {
      calls.push(["dispose", "visible"]);
    },
  };
  const selector = 'textarea[aria-label="Add a note"]';
  const page = mutationPage({ [selector]: [hidden, visible] });

  await typeAction(page, "connect", "note", [selector], "hello", {
    timeout: 0,
    minDelay: 0,
    maxDelay: 0,
  });

  assert.deepEqual(calls, [
    ["dispose", "hidden"],
    ["focus", "visible"],
    ["dispose", "visible"],
  ]);
  assert.equal(page.calls.some(([name]) => name === "focus"), false);
});

test("connect uses the 2026 semantic connect and success selectors", async () => {
  const primary = element();
  const send = element();
  const pending = element();
  const page = mutationPage({
    main: element(),
    "main h2": element("Ada Lovelace"),
    'main [data-view-name="profile-top-card"] a[href*="/preload/custom-invite/"]': primary,
    '[role="dialog"] button[type="submit"]:not(:disabled)': send,
    'main [aria-label*="Pending"][aria-label*="invitation"]': pending,
  });
  const policy = recordingPolicy();

  const result = await connect(page, { actionPolicy: policy }, {
    url: "https://www.linkedin.com/in/ada/",
    confirm: true,
    timeout: 0,
    clickDelay: 0,
  });

  assert.equal(result.status, "sent");
  assert.deepEqual(
    page.calls.filter(([name]) => name === "click").map(([, target]) => target),
    [primary, send]
  );
  assert.deepEqual(policy.calls.at(-1), ["complete", "connect"]);
});

test("connect navigates custom invite anchors before sending without a note", async () => {
  const primary = linkElement({
    text: "Connect",
    href: "https://www.linkedin.com/preload/custom-invite/?vanityName=siddhartshibiraj",
  });
  const send = element();
  const pending = element();
  const page = mutationPage({
    main: element(),
    "main h2": element("Siddhart Shibiraj"),
    'main [data-view-name="profile-top-card"] a[href*="/preload/custom-invite/"]': primary,
    '[role="dialog"] button[type="submit"]:not(:disabled)': send,
    'main [aria-label*="Pending"][aria-label*="invitation"]': pending,
  });

  const result = await connect(page, { actionPolicy: recordingPolicy() }, {
    url: "https://www.linkedin.com/in/siddhartshibiraj/",
    confirm: true,
    timeout: 0,
    clickDelay: 0,
  });

  assert.equal(result.status, "sent");
  assert.deepEqual(
    page.calls.filter(([name]) => name === "goto").map(([, url]) => url),
    [
      "https://www.linkedin.com/in/siddhartshibiraj/",
      "https://www.linkedin.com/preload/custom-invite/?vanityName=siddhartshibiraj",
      "https://www.linkedin.com/in/siddhartshibiraj/",
    ]
  );
  assert.equal(page.calls.some(([name, target]) => name === "click" && target === primary), false);
  assert.equal(page.calls.some(([name, target]) => name === "click" && target === send), true);
});

test("connect uses the top-card more menu for third-degree custom invites", async () => {
  const more = element();
  const menuItem = linkElement({
    text: "Connect",
    href: "https://www.linkedin.com/preload/custom-invite/?vanityName=avish-arora-",
  });
  const send = element();
  const pending = element();
  const page = mutationPage({
    main: element(),
    "main h2": element("Avish Arora"),
    'main section:has(h2) button[aria-label="More"]': more,
    '[role="menuitem"][href*="/preload/custom-invite/"]': menuItem,
    '[role="dialog"] button[type="submit"]:not(:disabled)': send,
    'main [aria-label*="Pending"][aria-label*="invitation"]': pending,
  });

  const result = await connect(page, { actionPolicy: recordingPolicy() }, {
    url: "https://www.linkedin.com/in/avish-arora-/",
    confirm: true,
    timeout: 0,
    clickDelay: 0,
  });

  assert.equal(result.status, "sent");
  assert.deepEqual(
    page.calls.filter(([name]) => name === "click").map(([, target]) => target),
    [more, send]
  );
  assert.deepEqual(
    page.calls.filter(([name]) => name === "goto").map(([, url]) => url),
    [
      "https://www.linkedin.com/in/avish-arora-/",
      "https://www.linkedin.com/preload/custom-invite/?vanityName=avish-arora-",
      "https://www.linkedin.com/in/avish-arora-/",
    ]
  );
});

test("message waits for Send hydration and verifies a sent event", async () => {
  const open = profileMessageElement({
    fullName: "Ada Lovelace",
    href: "https://www.linkedin.com/messaging/compose/?recipient=ada-id",
    headingLevel: "h2",
  });
  const calls = [];
  const editor = composeControl("ada-editor", calls);
  const send = composeControl("ada-send", calls);
  const root = composeRoot({
    profilePath: "/in/ada",
    recipient: "ada-id",
    editor,
    send,
    sendMisses: 1,
    sentState: { editorText: "", lastMessage: "Hello Ada" },
  });
  const page = mutationPage({
    main: element(),
    'main section:has(h2) a[href*="/messaging/compose/"][href*="recipient="]': open,
  });
  page.frameList = [messagingFrame(root)];
  const policy = recordingPolicy();
  let detectionCalls = 0;

  const result = await message(page, { actionPolicy: policy }, {
    url: "https://www.linkedin.com/in/ada/",
    message: "Hello {{firstName}}",
    confirm: true,
    timeout: 0,
    minDelay: 0,
    maxDelay: 0,
    clickDelay: 0,
    recipientTimeout: 0,
    controlTimeout: 10,
    controlInterval: 0,
    detectState: async () => {
      detectionCalls += 1;
      return detectionCalls === 1
        ? { state: "unknown", stop: true }
        : { state: "authenticated", stop: false };
    },
  });

  assert.equal(result.status, "sent");
  assert.deepEqual(
    page.calls.filter(([name]) => name === "goto").map(([, url]) => url),
    [
      "https://www.linkedin.com/in/ada/",
      "https://www.linkedin.com/messaging/compose/?recipient=ada-id",
    ]
  );
  assert.deepEqual(
    page.calls.filter(([name]) => name === "goto").map(([, , options]) => options),
    [
      { waitUntil: "domcontentloaded", timeout: 60000 },
      { waitUntil: "domcontentloaded", timeout: 30000 },
    ]
  );
  assert.equal(
    page.calls.some(([name, target]) => name === "click" && target === open),
    false
  );
  assert.equal(
    page.calls.filter(([name]) => name === "type").map(([, value]) => value).join(""),
    "Hello Ada"
  );
  assert.deepEqual(policy.calls.at(-1), ["complete", "message"]);
});

test("message rejects an unrelated global compose link before clicking", async () => {
  const unrelated = element();
  const page = mutationPage({
    main: element(),
    "main h2": element("Nivaas Sudhan"),
    'main a[href*="/messaging/compose/"][href*="recipient="]': unrelated,
  });
  const policy = recordingPolicy();

  await assert.rejects(
    message(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/nivaassudhan/",
      message: "hello",
      confirm: true,
      timeout: 0,
      clickDelay: 0,
    }),
    (error) => error.code === "TARGET_PROFILE_NOT_VERIFIED"
  );

  assert.equal(page.calls.some(([name]) => name === "click"), false);
});

test("message does not type when the opened compose recipient is unverified", async () => {
  const open = profileMessageElement({
    fullName: "Nivaas Sudhan",
    href: "https://www.linkedin.com/messaging/compose/?recipient=nivaas-id",
  });
  const calls = [];
  const wrongRoot = composeRoot({
    profilePath: "/in/shrinivaasan/",
    recipient: "shrinivaasan-id",
    editor: composeControl("wrong-editor", calls),
    send: composeControl("wrong-send", calls),
  });
  const page = mutationPage({
    main: element(),
    'main [data-view-name="profile-top-card"] a[href*="/messaging/compose/"][href*="recipient="]': open,
  });
  page.frameList = [messagingFrame(wrongRoot)];
  const policy = recordingPolicy();

  await assert.rejects(
    message(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/nivaassudhan/",
      message: "hello",
      confirm: true,
      timeout: 0,
      clickDelay: 0,
      minDelay: 0,
      maxDelay: 0,
      recipientTimeout: 0,
    }),
    (error) => error.code === "TARGET_PROFILE_NOT_VERIFIED"
  );

  assert.equal(page.calls.some(([name]) => name === "type"), false);
});

test("message binds typing and Send to the uniquely verified conversation", async () => {
  const open = profileMessageElement({
    fullName: "Nivaas Sudhan",
    href: "https://www.linkedin.com/messaging/compose/?recipient=nivaas-id",
  });
  const controlCalls = [];
  const wrongEditor = composeControl("shrinivaasan-editor", controlCalls);
  const wrongSend = composeControl("shrinivaasan-send", controlCalls, 10);
  const correctEditor = composeControl("nivaas-editor", controlCalls);
  const correctSend = composeControl("nivaas-send", controlCalls, 100);
  const wrongRoot = composeRoot({
    profilePath: "/in/shrinivaasan",
    recipient: "shrinivaasan-id",
    editor: wrongEditor,
    send: wrongSend,
  });
  const correctRoot = composeRoot({
    profilePath: "/in/nivaassudhan",
    recipient: "nivaas-id",
    editor: correctEditor,
    send: correctSend,
    sentState: { editorText: "", lastMessage: "hello" },
  });
  const page = mutationPage({
    main: element(),
    'main [data-view-name="profile-top-card"] a[href*="/messaging/compose/"][href*="recipient="]': open,
  });
  page.frameList = [messagingFrame(wrongRoot), messagingFrame(correctRoot)];
  const policy = recordingPolicy();

  const result = await message(page, { actionPolicy: policy }, {
    url: "https://www.linkedin.com/in/nivaassudhan/",
    message: "hello",
    confirm: true,
    timeout: 0,
    recipientTimeout: 0,
    clickDelay: 0,
    minDelay: 0,
    maxDelay: 0,
  });

  assert.equal(result.status, "sent");
  assert.deepEqual(
    controlCalls.filter(([name]) => name === "control-focus"),
    [["control-focus", "nivaas-editor"]]
  );
  assert.equal(page.calls.some(([name, x]) => name === "native-click" && x === 15), false);
  assert.equal(page.calls.some(([name, x]) => name === "native-click" && x === 105), true);
});

test("message rejects ambiguous controls inside the verified conversation", async () => {
  const open = profileMessageElement({
    fullName: "Nivaas Sudhan",
    href: "https://www.linkedin.com/messaging/compose/?recipient=nivaas-id",
  });
  const controlCalls = [];
  const root = composeRoot({
    profilePath: "/in/nivaassudhan",
    recipient: "nivaas-id",
    editor: [
      composeControl("first-editor", controlCalls),
      composeControl("second-editor", controlCalls),
    ],
    send: composeControl("send", controlCalls),
  });
  const page = mutationPage({
    main: element(),
    'main [data-view-name="profile-top-card"] a[href*="/messaging/compose/"][href*="recipient="]': open,
  });
  page.frameList = [messagingFrame(root)];

  await assert.rejects(
    message(page, { actionPolicy: recordingPolicy() }, {
      url: "https://www.linkedin.com/in/nivaassudhan/",
      message: "hello",
      confirm: true,
      timeout: 0,
      recipientTimeout: 0,
      clickDelay: 0,
    }),
    (error) => error.code === "AMBIGUOUS_COMPOSE_CONTROL"
  );
  assert.equal(page.calls.some(([name]) => name === "type"), false);
});

test("message rejects distinct editors split across selector fallbacks", async () => {
  const open = profileMessageElement({
    fullName: "Nivaas Sudhan",
    href: "https://www.linkedin.com/messaging/compose/?recipient=nivaas-id",
  });
  const controlCalls = [];
  const semanticEditor = composeControl("semantic-editor", controlCalls);
  const fallbackEditor = composeControl("fallback-editor", controlCalls);
  const send = composeControl("send", controlCalls);
  const root = composeRoot({
    profilePath: "/in/nivaassudhan",
    recipient: "nivaas-id",
    editor: semanticEditor,
    send,
  });
  root.$$ = async (selector) => {
    if (selector.includes(",") && selector.includes("contenteditable")) {
      return [semanticEditor, fallbackEditor];
    }
    if (selector === '[role="textbox"][contenteditable="true"]') {
      return [semanticEditor];
    }
    if (selector.includes("msg-form__contenteditable")) {
      return [fallbackEditor];
    }
    if (selector.includes("Send") || selector.includes("send-button")) {
      return [send];
    }
    return [];
  };
  const page = mutationPage({
    main: element(),
    'main [data-view-name="profile-top-card"] a[href*="/messaging/compose/"][href*="recipient="]': open,
  });
  page.frameList = [messagingFrame(root)];

  await assert.rejects(
    message(page, { actionPolicy: recordingPolicy() }, {
      url: "https://www.linkedin.com/in/nivaassudhan/",
      message: "hello",
      confirm: true,
      timeout: 0,
      recipientTimeout: 0,
      clickDelay: 0,
    }),
    (error) => error.code === "AMBIGUOUS_COMPOSE_CONTROL"
  );
  assert.equal(page.calls.some(([name]) => name === "type"), false);
});

test("message ignores target-profile links inside the wrong conversation body", async () => {
  const open = profileMessageElement({
    fullName: "Nivaas Sudhan",
    href: "https://www.linkedin.com/messaging/compose/?recipient=nivaas-id",
  });
  const controlCalls = [];
  const wrongRoot = composeRoot({
    profilePath: "/in/shrinivaasan",
    recipient: "shrinivaasan-id",
    decoyProfilePaths: ["/in/nivaassudhan"],
    editor: composeControl("wrong-editor", controlCalls),
    send: composeControl("wrong-send", controlCalls),
    sentState: { editorText: "", lastMessage: "hello" },
  });
  const page = mutationPage({
    main: element(),
    'main [data-view-name="profile-top-card"] a[href*="/messaging/compose/"][href*="recipient="]': open,
  });
  page.frameList = [messagingFrame(wrongRoot)];

  await assert.rejects(
    message(page, { actionPolicy: recordingPolicy() }, {
      url: "https://www.linkedin.com/in/nivaassudhan/",
      message: "hello",
      confirm: true,
      timeout: 0,
      recipientTimeout: 0,
      clickDelay: 0,
    }),
    (error) => error.code === "TARGET_PROFILE_NOT_VERIFIED"
  );
  assert.equal(page.calls.some(([name]) => name === "type"), false);
});

test("message success waits for an exact new row and an empty editor", async () => {
  const snapshots = [
    { editorText: "hello", lastMessage: "older message" },
    { editorText: "", lastMessage: "hello" },
  ];
  const context = {
    async evaluate() {
      return snapshots.shift();
    },
  };

  const result = await waitForMessageSent({}, context, "#editor", "hello", {
    detectState: async () => ({ state: "authenticated", stop: false }),
    timeout: 10,
    interval: 0,
  });

  assert.deepEqual(result, { editorText: "", lastMessage: "hello" });
});

test("like and endorse use semantic current selectors and success states", async () => {
  for (const [service, operation, current, success] of [
    [
      like,
      "like",
      'button[aria-pressed="false"][aria-label*="Like"]',
      'button[aria-pressed="true"][aria-label*="Like"]',
    ],
    [
      endorse,
      "endorse",
      'main button[aria-label^="Endorse "]',
      'main button[aria-label^="Endorsed "]',
    ],
  ]) {
    const control = operation === "endorse"
      ? endorsementControl("Analytical Engine")
      : element();
    const page = mutationPage({
      main: element(),
      [current]: control,
      [success]: element(),
    });
    const policy = recordingPolicy();
    const result = await service(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/ada/",
      confirm: true,
      timeout: 0,
      clickDelay: 0,
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(
      page.calls.filter(([name]) => name === "click").map(([, target]) => target),
      [control]
    );
    assert.deepEqual(policy.calls.at(-1), ["complete", operation]);
  }
});

test("endorse verification accepts LinkedIn replacing the clicked button node", async () => {
  const staleHandle = {
    async evaluate(callback) {
      return callback({
        getAttribute(name) {
          if (name === "aria-label") return "Endorse Core Java";
          if (name === "aria-pressed") return "false";
          return null;
        },
      });
    },
  };
  const page = {
    async evaluate(callback, skill) {
      const fakeDocument = {
        querySelector() {
          return this;
        },
        querySelectorAll(selector) {
          assert.match(selector, /Endorsed/);
          assert.equal(skill, "Core Java");
          return [{
            getAttribute(name) {
              if (name === "aria-label") return "Endorsed Core Java";
              if (name === "aria-pressed") return "false";
              return null;
            },
          }];
        },
      };
      global.document = fakeDocument;
      try {
        return callback(skill);
      } finally {
        delete global.document;
      }
    },
  };

  await waitForEndorsement(page, staleHandle, "Core Java", {
    timeout: 0,
    interval: 0,
  });
});

test("like accepts a rendered control below the current viewport", async () => {
  const control = {
    ...element(),
    async isIntersectingViewport() {
      return false;
    },
  };
  const page = mutationPage({
    main: element(),
    'button[aria-pressed="false"][aria-label*="Like"]': control,
    'button[aria-pressed="true"][aria-label*="Like"]': element(),
  });
  const policy = recordingPolicy();

  const result = await like(page, { actionPolicy: policy }, {
    url: "https://www.linkedin.com/in/ada/",
    confirm: true,
    timeout: 0,
    clickDelay: 0,
  });

  assert.equal(result.status, "completed");
  assert.equal(page.calls.some(([name, target]) => name === "click" && target === control), true);
});

test("like disposes both the clicked control and verified success handle", async () => {
  const disposed = [];
  const control = {
    ...element(),
    async dispose() {
      disposed.push("control");
    },
  };
  const success = {
    ...element(),
    async dispose() {
      disposed.push("success");
    },
  };
  const page = mutationPage({
    main: element(),
    'button[aria-pressed="false"][aria-label*="Like"]': control,
    'button[aria-pressed="true"][aria-label*="Like"]': success,
  });

  await like(page, { actionPolicy: recordingPolicy() }, {
    url: "https://www.linkedin.com/in/ada/",
    confirm: true,
    timeout: 0,
    clickDelay: 0,
  });

  assert.deepEqual(disposed, ["control", "success"]);
});

test("endorse rejects an unrelated skill that was already endorsed", async () => {
  const target = endorsementControl("Target Skill", { transition: false });
  target.dispose = async () => {
    throw new Error("Execution context was destroyed during cleanup");
  };
  const unrelatedSuccess = element();
  const page = mutationPage({
    main: element(),
    'main button[aria-label^="Endorse "]': target,
    'main button[aria-label^="Endorsed "]': unrelatedSuccess,
  });
  const policy = recordingPolicy();

  await assert.rejects(
    endorse(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/ada/",
      confirm: true,
      timeout: 0,
      clickDelay: 0,
    }),
    (error) => error.code === "ENDORSEMENT_NOT_VERIFIED"
  );
  assert.deepEqual(policy.calls.at(-1), [
    "reject",
    "endorse",
    "ENDORSEMENT_NOT_VERIFIED",
  ]);
});

test("an unconfirmed action never clicks", async () => {
  const page = mutationPage({
    main: element(),
    "main h2": element("Ada Lovelace"),
  });
  const policy = recordingPolicy();
  await assert.rejects(
    connect(page, { actionPolicy: policy }, {
      url: "https://www.linkedin.com/in/ada/",
      timeout: 0,
    }),
    (error) => error.code === "CONFIRMATION_REQUIRED"
  );
  assert.equal(page.calls.some(([name]) => name === "click"), false);
});
