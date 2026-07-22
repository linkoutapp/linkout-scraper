const readOnly = require("./read-only");
const auth = require("./auth");
const actions = require("./actions");
const salesNavigator = require("./sales-navigator");

const serviceWorkflows = Object.freeze({
  login: "auth.login",
  loginWithEmail: "auth.login",
  connect: "actions.connect",
  message: "actions.message",
  messagesFromChat: "readOnly.messaging",
  postsWithComments: "readOnly.activity",
  posts: "readOnly.activity",
  reactions: "readOnly.activity",
  comments: "readOnly.activity",
  connectionStatus: "readOnly.profile",
  send2FA: "auth.challenge",
  visit: "readOnly.profile",
  salesNavScraper: "salesNavigator",
  acceptedConnections: "readOnly.connections",
  like: "actions.like",
  endorse: "actions.endorse",
});

module.exports = Object.freeze({
  readOnly,
  auth,
  actions,
  salesNavigator,
  serviceWorkflows,
});
