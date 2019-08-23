const db = require("../db");

const { rescan } = require("./users");
const message = require("./message");

const bumpSessions = () => {
  const sessions = db.getSessionsToBump();
  sessions.map(message.bumpMentorRequest);
};

const init = () => {
  // bump dead requests every 30s
  setInterval(bumpSessions, 30000);
  bumpSessions();

  // rescan users list every 15min
  setInterval(rescan, 1000 * 60 * 15);
  rescan();
};
module.exports = {
  init
};
