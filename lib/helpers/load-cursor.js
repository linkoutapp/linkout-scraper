// load-cursor.js

const installMouseHelper = require("./show.mouse");

async function loadCursor(page, headless) {
  const { createCursor } = require("ghost-cursor");
  if (!headless) {
    await installMouseHelper(page);
  }
  page.cursor = await createCursor(page, undefined, false);
}

module.exports = loadCursor;
