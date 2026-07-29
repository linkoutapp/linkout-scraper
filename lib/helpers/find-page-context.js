const LinkoutError = require("../errors/linkout-error");

function isDetachedContextError(error) {
  const message = String((error && error.message) || "");
  return [
    /attempted to use detached frame/i,
    /cannot find context with specified id/i,
    /execution context was destroyed/i,
    /execution context is not available in detached frame or worker/i,
  ].some((pattern) => pattern.test(message));
}

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

async function hasVisibleStyle(handle) {
  if (!handle) return false;
  if (typeof handle.isVisible !== "function") return true;
  return handle.isVisible();
}

async function isVisible(handle) {
  if (!(await hasVisibleStyle(handle))) return false;
  if (typeof handle.isIntersectingViewport !== "function") return true;
  return handle.isIntersectingViewport();
}

async function isRendered(handle) {
  if (!handle || typeof handle.boundingBox !== "function") return false;
  if (!(await hasVisibleStyle(handle))) return false;
  return Boolean(await handle.boundingBox());
}

async function disposeHandles(handles, selected, primaryError) {
  let cleanupError;
  for (const handle of handles) {
    if (handle === selected || typeof handle.dispose !== "function") continue;
    try {
      await handle.dispose();
    } catch (error) {
      cleanupError ||= error;
    }
  }
  if (primaryError) throw primaryError;
  if (cleanupError) throw cleanupError;
}

async function findMatchingHandle(
  context,
  selector,
  visible,
  allowOffscreen,
  lookupTimeout
) {
  const handles = await boundedSelectorLookup(context, selector, lookupTimeout);

  let selected = null;
  let primaryError;
  try {
    for (const handle of handles) {
      if (
        !visible ||
        (await isVisible(handle)) ||
        (allowOffscreen && (await isRendered(handle)))
      ) {
        selected = handle;
        break;
      }
    }
  } catch (error) {
    primaryError = error;
  }

  await disposeHandles(handles, selected, primaryError);
  return selected;
}

function selectorLookupTimeout(timeout, interval) {
  const values = [timeout, interval]
    .filter((value) => Number.isFinite(value) && value > 0);
  return Math.max(1, Math.min(1000, ...values));
}

async function withSelectorLookupTimeout(promise, timeout, selector) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new LinkoutError(
            "SELECTOR_LOOKUP_TIMEOUT",
            "Selector lookup timed out",
            { selector, timeout }
          ));
        }, timeout);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function boundedSelectorLookup(context, selector, timeout) {
  const lookup = typeof context.$$ === "function"
    ? context.$$(selector)
    : context.$(selector).then((handle) => [handle].filter(Boolean));
  return withSelectorLookupTimeout(lookup, timeout, selector);
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
    allowOffscreen = false,
  }
) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new TypeError("candidates must be a non-empty array");
  }

  const startedAt = Date.now();
  const lookupTimeout = selectorLookupTimeout(timeout, interval);

  do {
    const frames = typeof page.frames === "function" ? page.frames() : [];
    const contexts = [...new Set([page, ...frames])];

    for (const context of contexts) {
      try {
        for (const selector of candidates) {
          const handle = await findMatchingHandle(
            context,
            selector,
            visible,
            allowOffscreen,
            lookupTimeout
          );
          if (handle) {
            return { context, selector, handle };
          }
        }
      } catch (error) {
        if (
          context === page ||
          (
            !isDetachedContextError(error) &&
            error.code !== "SELECTOR_LOOKUP_TIMEOUT"
          )
        ) {
          throw error;
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
  if (await findFirstSelector(page, selectors)) {
    return page;
  }

  const frames = typeof page.frames === "function" ? page.frames() : [];
  const contexts = [...new Set(frames)].filter((context) => context !== page);

  for (const context of contexts) {
    try {
      if (await findFirstSelector(context, selectors)) {
        return context;
      }
    } catch (error) {
      if (!isDetachedContextError(error)) {
        throw error;
      }
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
