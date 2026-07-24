const { resolveSelector } = require("../helpers/find-page-context");
const { clickVisible, typeVisible } = require("../interactions/browser-input");
const { jitteredDelay } = require("../interactions/timing");
const { createActionPolicy } = require("../policy/action-policy");

function getActionPolicy(cdp, data = {}) {
  return data.actionPolicy || (cdp && cdp.actionPolicy) || createActionPolicy();
}

function interactionOptions(data = {}) {
  return {
    detectState: data.detectState,
    delay:
      data.clickDelay === undefined
        ? jitteredDelay(450, { jitter: 200 })
        : data.clickDelay,
    postDelay:
      data.clickPostDelay === undefined
        ? jitteredDelay(350, { jitter: 150, random: data.random })
        : data.clickPostDelay,
    requireCursor: data.requireCursor === undefined ? true : data.requireCursor,
  };
}

async function disposeResolved(resolved, primaryError) {
  const handle = resolved && resolved.handle;
  let cleanupError;
  if (handle && typeof handle.dispose === "function") {
    try {
      await handle.dispose();
    } catch (error) {
      cleanupError = error;
    }
  }
  if (primaryError) throw primaryError;
  if (cleanupError) throw cleanupError;
}

async function resolveAction(page, workflow, name, candidates, data = {}) {
  return resolveSelector(page, {
    workflow,
    name,
    candidates,
    timeout: data.timeout === undefined ? 10000 : data.timeout,
    interval: data.interval === undefined ? 250 : data.interval,
    visible: true,
    allowOffscreen: true,
  });
}

async function assertAction(page, workflow, name, candidates, data = {}) {
  const resolved = await resolveAction(page, workflow, name, candidates, data);
  await disposeResolved(resolved);
  return resolved;
}

async function clickAction(page, workflow, name, candidates, data = {}) {
  const resolved = await resolveAction(page, workflow, name, candidates, data);
  let primaryError;
  try {
    await clickVisible(page, resolved.handle, {
      ...interactionOptions(data),
      preferNative: resolved.context !== page,
    });
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    await disposeResolved(resolved, primaryError);
  }
  return resolved;
}

async function typeAction(page, workflow, name, candidates, text, data = {}) {
  const resolved = await resolveAction(page, workflow, name, candidates, data);
  let primaryError;
  try {
    await typeVisible(page, resolved.selector, text, {
      context: resolved.context,
      target: resolved.handle,
      detectState: data.detectState,
      minDelay: data.minDelay === undefined ? 30 : data.minDelay,
      maxDelay: data.maxDelay === undefined ? 110 : data.maxDelay,
      postDelay:
        data.typePostDelay === undefined
          ? jitteredDelay(300, { jitter: 150, random: data.random })
          : data.typePostDelay,
      random: data.random,
      replace: data.replaceExisting === true,
    });
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    await disposeResolved(resolved, primaryError);
  }
  return resolved;
}

module.exports = {
  assertAction,
  clickAction,
  disposeResolved,
  getActionPolicy,
  interactionOptions,
  resolveAction,
  typeAction,
};
