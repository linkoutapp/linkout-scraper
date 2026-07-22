const { typeVisible } = require("../interactions/browser-input");

async function typeMessage(page, message, selector) {
  return typeVisible(page, selector, message, {
    detectState: async () => ({ state: "compatibility", stop: false }),
  });
}

module.exports = typeMessage;
