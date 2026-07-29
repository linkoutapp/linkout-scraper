const createLinkedinUrl = require("../helpers/create.linkedin.url");
const LinkoutError = require("../errors/linkout-error");
const { navigateLinkedIn } = require("../helpers/navigate-linkedin");
const { clickVisible } = require("../interactions/browser-input");
const { sleep } = require("../interactions/timing");
const selectors = require("../selectors/actions").endorse;
const {
  disposeResolved,
  getActionPolicy,
  interactionOptions,
  resolveAction,
} = require("./mutation-runtime");

async function readEndorsementState(handle) {
  return handle.evaluate((element) => ({
    label: String(element.getAttribute("aria-label") || "").trim(),
    pressed: element.getAttribute("aria-pressed") === "true",
  }));
}

async function readEndorsementStateFromPage(page, skill) {
  return page.evaluate((expectedSkill) => {
    const expected = String(expectedSkill || "").trim().toLowerCase();
    const controls = Array.from(
      (document.querySelector("main") || document).querySelectorAll(
        'button[aria-label^="Endorse "], button[aria-label^="Endorsed "], button[aria-label^="Remove endorsement"]'
      )
    );
    const exact = controls.find((element) => {
      const label = String(element.getAttribute("aria-label") || "")
        .trim()
        .toLowerCase();
      return (
        label === `endorse ${expected}` ||
        label === `endorsed ${expected}` ||
        label === `remove endorsement for ${expected}` ||
        label === `remove endorsement ${expected}`
      );
    });

    return exact
      ? {
          label: String(exact.getAttribute("aria-label") || "").trim(),
          pressed: exact.getAttribute("aria-pressed") === "true",
        }
      : null;
  }, skill);
}

function endorsementSkill(label) {
  const match = String(label || "").trim().match(/^Endorse\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function isEndorsedState(state, skill) {
  const label = String((state && state.label) || "").trim().toLowerCase();
  const expected = String(skill || "").trim().toLowerCase();
  return Boolean(
    state &&
    (
      state.pressed === true ||
      label === `endorsed ${expected}` ||
      label.startsWith("remove endorsement")
    )
  );
}

async function waitForEndorsement(
  page,
  handle,
  skill,
  { timeout = 10000, interval = 250 } = {}
) {
  const deadline = Date.now() + Math.max(0, timeout);
  do {
    if (isEndorsedState(await readEndorsementState(handle), skill)) return;
    if (page && isEndorsedState(
      await readEndorsementStateFromPage(page, skill),
      skill
    )) {
      return;
    }
    if (Date.now() >= deadline) break;
    await sleep(Math.min(
      Math.max(0, interval),
      Math.max(0, deadline - Date.now())
    ));
  } while (Date.now() <= deadline);

  throw new LinkoutError(
    "ENDORSEMENT_NOT_VERIFIED",
    `LinkedIn did not confirm endorsement for ${skill}`
  );
}

async function endorse(page, cdp, data = {}) {
  const target = await createLinkedinUrl(data.url, 3);
  await navigateLinkedIn(page, target, data);
  const transaction = await getActionPolicy(cdp, data).begin({
    operation: "endorse",
    target,
    confirm: data.confirm === true,
    page,
  });

  try {
    const resolved = await resolveAction(
      page,
      "endorse",
      "button",
      selectors.button,
      data
    );
    let primaryError;
    try {
      const skill = endorsementSkill((await readEndorsementState(resolved.handle)).label);
      if (!skill) {
        throw new LinkoutError(
          "ENDORSEMENT_TARGET_NOT_IDENTIFIED",
          "Could not identify the skill attached to the Endorse control"
        );
      }
      await clickVisible(page, resolved.handle, {
        ...interactionOptions(data),
        preferNative: resolved.context !== page,
      });
      await waitForEndorsement(page, resolved.handle, skill, {
        timeout: data.timeout === undefined ? 10000 : data.timeout,
        interval: data.interval === undefined ? 250 : data.interval,
      });
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      await disposeResolved(resolved, primaryError);
    }
    await transaction.complete();
    return { status: "completed", url: target };
  } catch (error) {
    await transaction.reject(error.code || "ENDORSE_FAILED");
    throw error;
  }
}

module.exports = endorse;
module.exports.endorsementSkill = endorsementSkill;
module.exports.isEndorsedState = isEndorsedState;
module.exports.readEndorsementStateFromPage = readEndorsementStateFromPage;
module.exports.waitForEndorsement = waitForEndorsement;
