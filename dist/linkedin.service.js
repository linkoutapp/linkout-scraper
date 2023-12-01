const login = require("./linkedin/linkedin.login.service");
const connect = require("./linkedin/linkedin.connect.service");
const message = require("./linkedin/linkedin.message.service");
const visit = require("./linkedin/linkedin.visit.service");
const acceptedConnections = require("./linkedin/linkedin.accepted.connection.request.service");
const like = require("./linkedin/linkedin.like.service");
const endorse = require("./linkedin/linkedin.endorse.service");
const loadCursor = require("./helpers/load-cursor");

module.exports = {
  services: {
    login,
    connect,
    message,
    visit,
    acceptedConnections,
    like,
    endorse
  },
  tools: {
    loadCursor
  }
};