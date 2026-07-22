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

module.exports = {
  findFirstSelector,
  findPageContext,
};
