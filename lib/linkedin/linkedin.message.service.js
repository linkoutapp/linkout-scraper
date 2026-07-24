const generateMessage = require("../helpers/generateMessage");
const LinkoutError = require("../errors/linkout-error");
const selectors = require("../selectors/actions").message;
const { detectPageState } = require("../browser/detect-page-state");
const { clickVisible, typeVisible } = require("../interactions/browser-input");
const { sleep } = require("../interactions/timing");
const {
  disposeResolved,
  getActionPolicy,
  interactionOptions,
  resolveAction,
} = require("./mutation-runtime");

function clean(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function profilePath(value) {
  try {
    const path = new URL(String(value)).pathname.replace(/\/+$/, "");
    return decodeURIComponent(path).toLowerCase();
  } catch (_) {
    return "";
  }
}

function targetNotVerified(message, details = {}) {
  return new LinkoutError("TARGET_PROFILE_NOT_VERIFIED", message, details);
}

async function inspectProfileMessageTarget(handle) {
  return handle.evaluate((element) => {
    const card = element.closest('[data-view-name="profile-top-card"]') ||
      element.closest("section");
    const heading = card && card.querySelector("h1,h2");
    return {
      fullName: String((heading && heading.textContent) || "")
        .trim()
        .replace(/\s+/g, " "),
      href: String(element.href || element.getAttribute("href") || ""),
    };
  });
}

async function resolveProfileMessageTarget(page, requestedUrl, data = {}) {
  const requestedPath = profilePath(requestedUrl);
  const currentPath = profilePath(await page.url());
  if (!requestedPath.startsWith("/in/") || currentPath !== requestedPath) {
    throw targetNotVerified("LinkedIn did not open the requested profile", {
      requestedPath,
      currentPath,
    });
  }

  let resolved;
  try {
    resolved = await resolveAction(page, "message", "profileOpen", selectors.open, data);
  } catch (error) {
    if (error && error.code === "SELECTOR_NOT_FOUND") {
      throw targetNotVerified("Could not find Message in the requested profile card", {
        requestedPath,
      });
    }
    throw error;
  }

  let target;
  let primaryError;
  try {
    target = await inspectProfileMessageTarget(resolved.handle);
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    await disposeResolved(resolved, primaryError);
  }
  let composeUrl;
  try {
    composeUrl = new URL(target.href, "https://www.linkedin.com");
  } catch (_) {
    throw targetNotVerified("The requested profile Message link is invalid");
  }

  const recipient = composeUrl.searchParams.get("recipient");
  if (!target.fullName || composeUrl.pathname !== "/messaging/compose/" || !recipient) {
    throw targetNotVerified("The requested profile Message target is incomplete", {
      requestedPath,
    });
  }

  const [firstName = "", ...remainingNameParts] = target.fullName.split(" ");
  return {
    context: resolved.context,
    selector: resolved.selector,
    href: composeUrl.href,
    profilePath: requestedPath,
    recipient,
    profileData: {
      fullName: target.fullName,
      firstName,
      lastName: remainingNameParts.join(" "),
    },
  };
}

async function inspectComposeRoot(root, expectedPath, expectedRecipient) {
  return root.evaluate(
    (element, { path, recipient }) => {
      const pathOf = (value) => {
        try {
          return decodeURIComponent(new URL(String(value), location.origin).pathname)
            .replace(/\/+$/, "")
            .toLowerCase();
        } catch (_) {
          return "";
        }
      };
      const identitySelector = [
        ":scope > header",
        ".msg-overlay-bubble-header",
        ".msg-overlay-bubble-header__details",
        ".msg-thread__link-to-profile",
        '[data-view-name="conversation-header"]',
        '[data-view-name="message-overlay-header"]',
      ].join(",");
      const identityRoots = Array.from(element.querySelectorAll(identitySelector));
      const links = Array.from(new Set(identityRoots.flatMap((identityRoot) => [
        ...(identityRoot.matches("a[href]") ? [identityRoot] : []),
        ...identityRoot.querySelectorAll("a[href]"),
      ]))).filter((link) => link.getClientRects().length > 0);
      const profilePaths = links
        .map((link) => pathOf(link.href || link.getAttribute("href")))
        .filter((value) => value.startsWith("/in/"));
      const recipientIds = links.flatMap((link) => {
        try {
          const value = new URL(
            String(link.href || link.getAttribute("href")),
            location.origin
          ).searchParams.get("recipient");
          return value ? [value] : [];
        } catch (_) {
          return [];
        }
      });

      return {
        visible: element.getClientRects().length > 0,
        profilePaths,
        recipientIds,
        headerPathMatch: profilePaths.includes(path),
        headerRecipientMatch: recipientIds.includes(recipient),
        ready:
          Array.from(element.querySelectorAll([
            '[role="textbox"][contenteditable="true"]',
            '.msg-form__contenteditable[contenteditable="true"]',
            ".msg-form__contenteditable",
          ].join(","))).filter((control) => control.getClientRects().length > 0).length === 1 &&
          Array.from(element.querySelectorAll([
            'button[type="submit"][aria-label*="Send"]',
            ".msg-form__send-button",
          ].join(","))).filter((control) => control.getClientRects().length > 0).length === 1,
      };
    },
    { path: expectedPath, recipient: expectedRecipient }
  );
}

async function pageComposeRoots(page) {
  if (typeof page.$$ !== "function") return [];
  return page.$$(selectors.composeRoot.join(","));
}

async function frameComposeRoot(frame) {
  try {
    const path = new URL(String(frame.url())).pathname;
    if (!path.includes("/messaging/") && !path.includes("/preload/")) return null;
  } catch (_) {
    return null;
  }
  return frame.$("body");
}

function contextComposeRecipientMatches(context, expectedRecipient) {
  try {
    const url = new URL(String(context.url()));
    return (
      url.pathname === "/messaging/compose/" &&
      url.searchParams.get("recipient") === expectedRecipient
    );
  } catch (_) {
    return false;
  }
}

async function verifyComposeRecipient(
  page,
  target,
  {
    recipientTimeout = 30000,
    recipientInterval = 250,
    detectState = detectPageState,
  } = {}
) {
  const deadline = Date.now() + Math.max(0, recipientTimeout);
  do {
    const state = await detectState(page);
    if (state && state.stop && state.state !== "unknown") {
      throw new LinkoutError(
        "PAGE_STATE_STOP",
        `LinkedIn interaction stopped: ${state.state}`,
        { state: state.state }
      );
    }

    const frames = typeof page.frames === "function" ? page.frames() : [];
    const candidates = (await pageComposeRoots(page)).map((root) => ({
      context: page,
      root,
    }));
    for (const frame of frames) {
      const root = await frameComposeRoot(frame);
      if (root) candidates.push({ context: frame, root });
    }

    const verified = [];
    for (const candidate of candidates) {
      const details = await inspectComposeRoot(
        candidate.root,
        target.profilePath,
        target.recipient
      );
      const urlRecipientMatch = contextComposeRecipientMatches(
        candidate.context,
        target.recipient
      );
      if (
        details.visible &&
        details.ready &&
        (details.headerPathMatch || details.headerRecipientMatch || urlRecipientMatch)
      ) {
        verified.push({
          ...candidate,
          signal: urlRecipientMatch
            ? "compose-url"
            : details.headerRecipientMatch
              ? "recipient"
              : "profile",
        });
      }
    }
    if (verified.length === 1) return verified[0];
    if (verified.length > 1) {
      throw targetNotVerified("More than one visible compose matched the requested profile", {
        requestedPath: target.profilePath,
      });
    }

    if (Date.now() >= deadline) break;
    await sleep(recipientInterval);
  } while (Date.now() <= deadline);

  throw targetNotVerified("Could not verify the opened compose recipient", {
    requestedPath: target.profilePath,
    expectedName: target.profileData.fullName,
  });
}

async function resolveComposeControl(compose, name, candidates) {
  const selector = candidates.join(",");
  const handles = typeof compose.root.$$ === "function"
    ? await compose.root.$$(selector)
    : [];
  if (typeof compose.root.$$ !== "function") {
    for (const candidate of candidates) {
      const handle = await compose.root.$(candidate);
      if (handle && !handles.includes(handle)) handles.push(handle);
    }
  }

  const visible = [];
  for (const handle of handles) {
    if (typeof handle.isIntersectingViewport === "function") {
      if (await handle.isIntersectingViewport()) visible.push(handle);
    } else if (typeof handle.boundingBox === "function") {
      if (await handle.boundingBox()) visible.push(handle);
    } else {
      visible.push(handle);
    }
  }
  if (visible.length === 1) {
    return { ...compose, name, selector, handle: visible[0] };
  }
  if (visible.length > 1) {
    throw new LinkoutError(
      "AMBIGUOUS_COMPOSE_CONTROL",
      `Found multiple visible message.${name} controls in the verified compose`,
      { workflow: "message", element: name, selector }
    );
  }
  throw new LinkoutError(
    "SELECTOR_NOT_FOUND",
    `Could not find message.${name} in the verified compose`,
    { workflow: "message", element: name, candidates: [...candidates] }
  );
}

async function waitForComposeControl(
  compose,
  name,
  candidates,
  { controlTimeout = 10000, controlInterval = 250 } = {}
) {
  const deadline = Date.now() + Math.max(0, controlTimeout);
  do {
    try {
      return await resolveComposeControl(compose, name, candidates);
    } catch (error) {
      if (!error || error.code !== "SELECTOR_NOT_FOUND") throw error;
      if (Date.now() >= deadline) throw error;
    }
    await sleep(controlInterval);
  } while (Date.now() <= deadline);
}

async function readMessageState(root, editorSelector) {
  return root.evaluate((element, selector) => {
    const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ");
    const editors = Array.from(element.querySelectorAll(selector));
    const editor = editors.find((element) => element.getClientRects().length) || editors[0];
    const events = Array.from(
      element.querySelectorAll(".msg-s-message-list__event")
    );
    const latest = events.at(-1);
    const message = latest && (
      latest.querySelector(".msg-s-event-listitem__body") ||
      Array.from(latest.querySelectorAll("p")).find((element) =>
        normalize(element.textContent)
      )
    );

    return {
      editorText: normalize(editor && editor.textContent),
      lastMessage: normalize(message && message.textContent),
    };
  }, editorSelector);
}

async function waitForMessageSent(
  page,
  root,
  editorSelector,
  expectedMessage,
  {
    timeout = 10000,
    interval = 250,
    detectState = detectPageState,
  } = {}
) {
  const deadline = Date.now() + Math.max(0, timeout);
  const expected = clean(expectedMessage);
  do {
    const state = await detectState(page);
    if (state && state.stop) {
      throw new LinkoutError(
        "PAGE_STATE_STOP",
        `LinkedIn interaction stopped: ${state.state}`,
        { state: state.state }
      );
    }

    const snapshot = await readMessageState(root, editorSelector);
    if (snapshot.editorText === "" && snapshot.lastMessage === expected) {
      return snapshot;
    }

    if (Date.now() >= deadline) break;
    await sleep(interval);
  } while (Date.now() <= deadline);

  throw new LinkoutError(
    "SENT_STATE_NOT_VERIFIED",
    "LinkedIn did not show the exact sent message before timeout"
  );
}

async function message(page, cdp, data = {}) {
  const { url, message: template, confirm = false } = data;
  await page.goto(url);
  const target = await resolveProfileMessageTarget(page, url, data);
  const { profileData } = target;

  const policy = getActionPolicy(cdp, data);
  const transaction = await policy.begin({
    operation: "message",
    target: url,
    confirm,
    page,
  });

  try {
    await page.goto(target.href, {
      waitUntil: "domcontentloaded",
      timeout: data.navigationTimeout === undefined ? 30000 : data.navigationTimeout,
    });
    const compose = await verifyComposeRecipient(page, target, data);
    const renderedMessage = generateMessage(String(template || ""), profileData);
    const editor = await resolveComposeControl(compose, "editor", selectors.editor);
    await typeVisible(
      page,
      editor.selector,
      renderedMessage,
      {
        context: editor.context,
        target: editor.handle,
        detectState: data.detectState,
        minDelay: data.minDelay === undefined ? 30 : data.minDelay,
        maxDelay: data.maxDelay === undefined ? 110 : data.maxDelay,
        random: data.random,
        replace: true,
      }
    );
    const send = await waitForComposeControl(compose, "send", selectors.send, data);
    await clickVisible(page, send.handle, {
      ...interactionOptions(data),
      preferNative: send.context !== page,
    });
    await waitForMessageSent(
      page,
      compose.root,
      editor.selector,
      renderedMessage,
      data
    );
    await transaction.complete();
    return { status: "sent", profileData };
  } catch (error) {
    await transaction.reject(error.code || "MESSAGE_FAILED");
    throw error;
  }
}

module.exports = message;
module.exports.inspectProfileMessageTarget = inspectProfileMessageTarget;
module.exports.resolveProfileMessageTarget = resolveProfileMessageTarget;
module.exports.inspectComposeRoot = inspectComposeRoot;
module.exports.verifyComposeRecipient = verifyComposeRecipient;
module.exports.resolveComposeControl = resolveComposeControl;
module.exports.waitForComposeControl = waitForComposeControl;
module.exports.readMessageState = readMessageState;
module.exports.waitForMessageSent = waitForMessageSent;
