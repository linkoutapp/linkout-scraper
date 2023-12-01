// timer.js

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function timer(num) {
  return new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, num + randomIntFromInterval(-1000, 1000));
  });
}

module.exports = timer;
