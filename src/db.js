const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

const { CHANNEL_ID } = require("../config");

const getChannelId = () => CHANNEL_ID;

const getSession = user =>
  db
    .get("sessions")
    .get(user)
    .value();

const updateSession = (user, newSession) => {
  const session = {...getSession(user), ...newSession, id: user};
  return db.get("sessions").set(user, session).write()[user];
}

const clearSession = user =>
  db
    .get("sessions")
    .get(user)
    .set("ts", undefined)
    .set("mentor", undefined)
    .set("mentor_claim_ts", undefined)
    .set("group_id", undefined)
    .write();

const getUserIdByThreadTs = threadTs =>
  db
    .get("sessions")
    .findKey(channel => channel.ts === threadTs)
    .value();

module.exports = {
  getChannelId,
  getSession,
  clearSession,
  getUserIdByThreadTs,
  updateSession
};
