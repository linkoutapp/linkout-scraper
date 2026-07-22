const connect = require("./linkedin/linkedin.connect.service");
const message = require("./linkedin/linkedin.message.service");
const messagesFromChat = require("./linkedin/linkedin.messages.from.chat.service");
const postsWithComments = require("./linkedin/linkedin.posts.with.comments");
const posts = require("./linkedin/linkedin.posts");
const reactions = require("./linkedin/linkedin.reactions");
const comments = require("./linkedin/linkedin.comments");
const connectionStatus = require("./linkedin/linkedin.connection.status");
const visit = require("./linkedin/linkedin.visit.service");
const salesNavScraper = require("./linkedin/linkedin.sales.nav.scraper");
const acceptedConnections = require("./linkedin/linkedin.accepted.connection.request.service");
const like = require("./linkedin/linkedin.like.service");
const endorse = require("./linkedin/linkedin.endorse.service");
const loadCursor = require("./helpers/load-cursor");
const {
  connectLocalChrome,
  validateDevtoolsEndpoint,
} = require("./browser/connect-local-chrome");
const { detectPageState } = require("./browser/detect-page-state");
const { resolveSelector } = require("./helpers/find-page-context");
const { createActionPolicy } = require("./policy/action-policy");

module.exports = {
  services: {
    connect,
    message,
    messagesFromChat,
    postsWithComments,
    posts,
    reactions,
    comments,
    connectionStatus,
    visit,
    salesNavScraper,
    acceptedConnections,
    like,
    endorse,
  },
  tools: {
    loadCursor,
    connectLocalChrome,
    validateDevtoolsEndpoint,
    createActionPolicy,
    detectPageState,
    resolveSelector,
  },
};
