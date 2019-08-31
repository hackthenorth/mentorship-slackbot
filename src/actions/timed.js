const db = require("../db");

const { rescan } = require("./users");
const message = require("./message");

const start = new Date("2019-09-13T21:00:00-0400");
const end = new Date("2019-09-15T12:00:00-0400");

const runnable = () => {
  const date = new Date();
  const output = start <= date && date <= end;
  if (!output) {
    console.log(`${start} <= ${date} && ${date} <= ${end} is false, not running`);
  }
  return output;
};

const interval = (fn, ms) => setInterval(() => {
  if (new Date() <= end) fn();
}, ms);

const bumpSessions = () => {
  const sessions = db.getSessionsToBump();
  sessions.map(message.bumpMentorRequest);
};

const stats = () => {
  if (!runnable()) return;
  const online = db.getOnline();
  message.stats({
    online
  });
};

const init = () => {
  // bump dead requests every 30s
  interval(bumpSessions, 30000);
  bumpSessions();

  // rescan users list every 15min
  interval(rescan, 1000 * 60 * 15);
  rescan();

  // send stats every hour
  interval(stats, 1000 * 60 * 60);
};
module.exports = {
  init,
  runnable
};
