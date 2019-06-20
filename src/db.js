const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

const { CHANNEL_ID } = require("../config");

// Set some defaults (required if your JSON file is empty)
db.defaults({ channel_id: CHANNEL_ID || "", sessions: {} }).write();

const getChannelId = () => db.get("channel_id").value();

const setChannelId = id => db.set("channel_id", id).write();

const createSession = (user, channel, ts, source_ts) => {
  // one thread per user, need a better way to insert unique objects
  console.log("pushing new thread", user, channel, ts, source_ts);
  db.get("sessions")
    .set(user, { channel, ts, source_ts })
    .write();
};

const getSession = user =>
  db
    .get("sessions")
    .get(user)
    .value();

const clearSession = user =>
  db
    .get("sessions")
    .get(user)
    .set("ts", undefined)
    .write();

const getUserIdByThreadTs = threadTs => 
  db
    .get("sessions")
    .findKey(channel => channel.ts === threadTs)
    .value();

module.exports = {
  getChannelId,
  setChannelId,
  createSession,
  getSession,
  clearSession,
  getUserIdByThreadTs
};
