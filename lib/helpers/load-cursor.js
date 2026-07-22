async function loadCursor(page) {
  const { createCursor } = require("ghost-cursor");
  page.cursor = await createCursor(page, undefined, false);
}

module.exports = loadCursor;
