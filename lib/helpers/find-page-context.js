const LinkoutError = require("../errors/linkout-error");

async function findFirstSelector(context, selectors) {
  for (const selector of selectors) {
    if (await context.$(selector)) {
      return selector;
    }
  }

  return null;
}

async function sanitizePageUrl(page) {
  try {
    const rawUrl = await page.url();
    const url = new URL(String(rawUrl));
    return `${url.origin}${url.pathname}`;
  } catch (_) {
    return "";
  }
}

async function isVisible(handle) {
  if (!handle) return false;
  if (typeof handle.isIntersectingViewport !== "function") return true;

  try {
    return await handle.isIntersectingViewport();
  } catch (_) {
    return false;
  }
}

async function resolveSelector(
  page,
  {
    workflow,
    name,
    candidates,
    timeout = 10000,
    interval = 250,
    visible = false,
  }
) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new TypeError("candidates must be a non-empty array");
  }

  const startedAt = Date.now();

  do {
    const frames = typeof page.frames === "function" ? page.frames() : [];
    const contexts = [...new Set([page, ...frames])];

    for (const context of contexts) {
      for (const selector of candidates) {
        const handle = await context.$(selector);
        if (handle && (!visible || (await isVisible(handle)))) {
          return { context, selector, handle };
        }
      }
    }

    if (Date.now() - startedAt >= timeout) break;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(interval, Math.max(timeout, 0)))
    );
  } while (Date.now() - startedAt <= timeout);

  throw new LinkoutError(
    "SELECTOR_NOT_FOUND",
    `Could not find ${workflow}.${name} within ${timeout}ms`,
    {
      workflow: String(workflow || "unknown"),
      element: String(name || "unknown"),
      candidates: [...candidates],
      url: await sanitizePageUrl(page),
      timeout,
    }
  );
}

async function findPageContext(page, selectors) {
  const frames = typeof page.frames === "function" ? page.frames() : [];
  const contexts = [...new Set([page, ...frames])];

  for (const context of contexts) {
    if (await findFirstSelector(context, selectors)) {
      return context;
    }
  }

  return null;
}

async function waitForPageContext(
  page,
  selectors,
  { timeout = 10000, interval = 250 } = {}
) {
  const deadline = Date.now() + timeout;

  do {
    const context = await findPageContext(page, selectors);
    if (context) {
      return context;
    }

    if (Date.now() >= deadline) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  } while (Date.now() <= deadline);

  return null;
}

module.exports = {
  findFirstSelector,
  findPageContext,
  resolveSelector,
  sanitizePageUrl,
  waitForPageContext,
};
