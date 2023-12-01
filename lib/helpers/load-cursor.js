// load-cursor.js

const { createCursor } = require("ghost-cursor");
const installMouseHelper = require("./show.mouse");

async function loadCursor(page, headless) {
  if (!headless) {
    await installMouseHelper(page);
  }
  page.cursor = await createCursor(page);
}

module.exports = loadCursor;
