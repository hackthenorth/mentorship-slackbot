const { SKILLS } = require("../../config");

const db = require("../db");
const message = require("../actions/message");

const messageHandler = event => {
  // ignore bot messages
  if (
    event.bot_id != null ||
    (event.message != null && event.message.bot_id != null) ||
    (event.previous_message != null && event.previous_message.bot_id != null)
  )
    return;

  if (event.channel_type === "group") {
    // private channel messages
    if (event.subtype === "bot_message") {
    } else {
      // send thread message to DM
      const user = db.getUserIdByThreadTs(event.thread_ts);
      if (user) {
        // implicity update the session last_updated
        const session = db.updateSession(user, {});
        if (session && session.submission) {
          message.postThreadMessageToDM(session, event.ts, event.text);
        }
      }
    }
  } else if (event.channel_type === "im") {
    const mentor = db.getMentor(event.user);
    if (mentor != null) {
      const text = event.text.trim();
      if (text.indexOf("!skills") === 0) {
        const parts = text
          .substring(7)
          .split(' ')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        if (parts.length === 1 && parts[0] === 'help') {
          message.skillsHelp(event.user);
        } else {
          const skillsObj = {};
          for (const part of parts) {
            if (part in SKILLS) {
              skillsObj[part] = true;
            }
          }
          db.setMentorSkills(event.user, skillsObj);
          message.skillsSet(event.user, Object.keys(skillsObj));
        }
      } else {
        message.noUnderstandMentor(event.user);
      }
    } else {
      // DM's
      const session = db.getSession(event.user);
      if (
        !event.subtype &&
        session != null &&
        session.ts != null &&
        session.mentee_ts === event.thread_ts
      ) {
        // user messages
        // if the user has a request, post DM's to the thread
        message.postDMToThread(session, event.ts, event.text);
      } else {
        if (session != null) {
          if (session.ts != null) {
            message.noUnderstand(session);
          } else {
            message.noSession(session);
          }
        } else {
          message.welcome(session);
        }
      }
    }
  }
};

module.exports = messageHandler;
