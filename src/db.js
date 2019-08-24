const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

const { CHANNEL_ID } = require("../config");

const getChannelId = () => CHANNEL_ID;

if (db.get("sessions").value() == null) {
  db.set("sessions", {}).write();
}

const getSession = user =>
  db
    .get("sessions")
    .get(user)
    .value();

const getSessionsToBump = () => {
  const sessions = db.get("sessions").filter(session => 
      session.submission != null && 
      session.mentor == null && 
      new Date(session.last_updated).getTime() < new Date().getTime() - (1000 * 60 * 10)
  ).value();
  for (const session of sessions) {
    db.get("sessions").get(session.id).set("last_updated", new Date().toString()).write();
  }
  return sessions;
}

const updateSession = (user, newSession) => {
  const session = {...(getSession(user) || {}), ...newSession, id: user, last_updated: new Date().toString()};
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

const getMentors = () =>
  db
    .get("mentors")
    .value() || {};

const setMentors = (mentors) =>
  db 
    .set("mentors", mentors)
    .write();

const getMentor = (user) =>
  db
    .get("mentors")
    .get(user)
    .value();
  
const setMentorSkills = (user, skills) =>
  db
    .get("mentors")
    .get(user)
    .set("skills", skills)
    .write();

const getOnline = () => 
  db
    .get("online")
    .value() || 0;

const setOnline = (count) =>
  db
    .set("online", count)
    .write();

module.exports = {
  getChannelId,
  getSession,
  getSessionsToBump,
  clearSession,
  getUserIdByThreadTs,
  updateSession,
  getMentors,
  setMentors,
  getMentor,
  setMentorSkills,
  getOnline,
  setOnline,
};
