const login = require("./linkedin/linkedin.login.service");
const loginWithEmail = require("./linkedin/linkedin.login.with.email.service");
const connect = require("./linkedin/linkedin.connect.service");
const message = require("./linkedin/linkedin.message.service");
const messagesFromChat = require("./linkedin/linkedin.messages.from.chat.service");
const postsWithComments = require("./linkedin/linkedin.posts.with.comments");
const posts = require("./linkedin/linkedin.posts");
const reactions = require("./linkedin/linkedin.reactions");
const comments = require("./linkedin/linkedin.comments");
const connectionStatus = require("./linkedin/linkedin.connection.status");
const send2FA = require("./linkedin/linkedin.send2FA");
const visit = require("./linkedin/linkedin.visit.service");
const salesNavScraper = require("./linkedin/linkedin.sales.nav.scraper");
const acceptedConnections = require("./linkedin/linkedin.accepted.connection.request.service");
const like = require("./linkedin/linkedin.like.service");
const endorse = require("./linkedin/linkedin.endorse.service");
const loadCursor = require("./helpers/load-cursor");
const setUserAgent = require("./helpers/setUserAgent");

module.exports = {
  services: {
    login,
    loginWithEmail,
    connect,
    message,
    messagesFromChat,
    postsWithComments,
    posts,
    reactions,
    comments,
    connectionStatus,
    send2FA,
    visit,
    salesNavScraper,
    acceptedConnections,
    like,
    endorse,
  },
  tools: {
    loadCursor,
    setUserAgent,
  },
};
