import config from "config";

import * as db from "db";
import * as message from "actions/message";
import * as timed from "../actions/timed";
import { UserID, isActive } from "typings";

interface Event {
  bot_id?: string;
  channel_type: string;
  message?: {
    bot_id?: string;
  };
  previous_message?: {
    bot_id?: string;
  };
  text: string;
  user: UserID;
}
const messageHandler = (event: Event) => {
  // ignore bot messages
  if (
    event.bot_id != null ||
    (event.message != null && event.message.bot_id != null) ||
    (event.previous_message != null && event.previous_message.bot_id != null)
  ) {
    return;
  }

  if (event.channel_type === "im") {
    const mentor = db.getMentor(event.user);
    if (mentor != null) {
      const text = event.text.trim();
      if (text.indexOf("!skills") === 0) {
        const parts = text
          .substring(7)
          .split(" ")
          .map(s => s.trim())
          .filter(s => s.length > 0);
        if (parts.length === 1 && parts[0] === "help") {
          message.skillsHelp(event.user);
        } else {
          const skillsObj = {};
          for (const part of parts) {
            if (part in config.SKILLS) {
              skillsObj[part] = true;
            }
          }
          db.setMentorSkills(event.user, skillsObj);
          message.skillsSet(event.user, Object.keys(skillsObj));
        }
      } else if (text === "!stats") {
        timed.stats();
      } else {
        message.noUnderstandMentor(event.user);
      }
    } else {
      // DM's
      const session = db.getSession(event.user);
      if (session != null) {
        if (isActive(session)) {
          message.noUnderstand(session);
        } else {
          message.noSession(session);
        }
      } else {
        message.welcome(session);
      }
    }
  }
};

export const handle = messageHandler;
