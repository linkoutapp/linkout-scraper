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
  { detectState = defaultDetectPageState, delay = 0, mouseSteps = 12 } = {}
) {
  await assertPageReady(page, detectState);
  await sleep(delay);

  if (page.cursor && typeof page.cursor.click === "function") {
    await page.cursor.click(target);
  } else {
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
    detectState = defaultDetectPageState,
    minDelay = 30,
    maxDelay = 110,
    random = Math.random,
  } = {}
) {
  await assertPageReady(page, detectState);
  await page.focus(selector);
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
