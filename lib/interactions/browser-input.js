const LinkoutError = require("../errors/linkout-error");
const { detectPageState: defaultDetectPageState } = require("../browser/detect-page-state");
const { boundedRandom, sleep } = require("./timing");

async function assertPageReady(page, detectState) {
  if (typeof detectState !== "function") return;
  const result = await detectState(page);
  if (result && result.stop) {
    throw new LinkoutError(
      "PAGE_STATE_STOP",
      `LinkedIn interaction stopped: ${result.state}`,
      { state: result.state }
    );
  }
}

async function clickVisible(
  page,
  target,
  {
    detectState = defaultDetectPageState,
    delay = 0,
    mouseSteps = 12,
    preferNative = false,
  } = {}
) {
  await assertPageReady(page, detectState);
  await sleep(delay);

  if (!preferNative && page.cursor && typeof page.cursor.click === "function") {
    await page.cursor.click(target);
  } else {
    if (target && typeof target.scrollIntoView === "function") {
      await target.scrollIntoView();
    }
    const box = target && typeof target.boundingBox === "function"
      ? await target.boundingBox()
      : null;
    if (!box || !page.mouse) {
      throw new LinkoutError(
        "ELEMENT_NOT_VISIBLE",
        "Cannot click an element without visible coordinates"
      );
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y, { steps: mouseSteps });
    await page.mouse.click(x, y);
  }

  await assertPageReady(page, detectState);
}

async function typeVisible(
  page,
  selector,
  text,
  {
    context = page,
    detectState = defaultDetectPageState,
    minDelay = 30,
    maxDelay = 110,
    random = Math.random,
    replace = false,
    target,
  } = {}
) {
  await assertPageReady(page, detectState);
  if (target && typeof target.focus === "function") {
    await target.focus();
  } else {
    await context.focus(selector);
  }
  if (replace) {
    await page.keyboard.down("Meta");
    try {
      await page.keyboard.press("KeyA");
    } finally {
      await page.keyboard.up("Meta");
    }
    await page.keyboard.press("Backspace");
  }
  for (const character of [...String(text || "")]) {
    const delay = boundedRandom(minDelay, maxDelay, random);
    await page.keyboard.type(character, { delay });
  }
  await assertPageReady(page, detectState);
}

module.exports = {
  assertPageReady,
  clickVisible,
  typeVisible,
};
