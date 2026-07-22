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
  };
}

async function resolveAction(page, workflow, name, candidates, data = {}) {
  return resolveSelector(page, {
    workflow,
    name,
    candidates,
    timeout: data.timeout === undefined ? 10000 : data.timeout,
    interval: data.interval === undefined ? 250 : data.interval,
    visible: true,
  });
}

async function clickAction(page, workflow, name, candidates, data = {}) {
  const resolved = await resolveAction(page, workflow, name, candidates, data);
  await clickVisible(page, resolved.handle, interactionOptions(data));
  return resolved;
}

async function typeAction(page, workflow, name, candidates, text, data = {}) {
  const resolved = await resolveAction(page, workflow, name, candidates, data);
  await typeVisible(page, resolved.selector, text, {
    detectState: data.detectState,
    minDelay: data.minDelay === undefined ? 30 : data.minDelay,
    maxDelay: data.maxDelay === undefined ? 110 : data.maxDelay,
    random: data.random,
  });
  return resolved;
}

module.exports = {
  clickAction,
  getActionPolicy,
  interactionOptions,
  resolveAction,
  typeAction,
};
