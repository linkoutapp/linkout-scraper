async function findFirstSelector(context, selectors) {
  for (const selector of selectors) {
    if (await context.$(selector)) {
      return selector;
    }
  }

  return null;
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
  waitForPageContext,
};
