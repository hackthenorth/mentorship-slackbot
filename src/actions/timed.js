const db = require("../db");

const { rescan } = require("./users");
const message = require("./message");

const { runnable, interval } = require("../date");

const bumpSessions = () => {
  const sessions = db.getSessionsToBump();
  sessions.map(message.bumpMentorRequest);
};

const stats = () => {
  if (!runnable()) return;
  const online = db.getOnline();
  const created = db.getCreated();
  message.stats({
    created,
    online,
  });
};

const init = () => {
  // bump dead requests every 30s
  interval(bumpSessions, 30000);
  bumpSessions();

  // rescan users list every 15min
  interval(rescan, 1000 * 60 * 15);
  rescan();

  // send stats every 2 hours
  interval(stats, 1000 * 60 * 60 * 2);
  stats();
};
module.exports = {
  init,
  runnable
};
