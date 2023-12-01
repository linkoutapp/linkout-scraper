// typeMessage.js

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const delay = 30;

async function typeMessage(page, message, selector) {
  await page.focus(selector);

  for (const char of message) {
    const randInt = delay + randomIntFromInterval(-100, 100);
    await page.keyboard.type(char, { randInt });
  }
}

module.exports = typeMessage;
