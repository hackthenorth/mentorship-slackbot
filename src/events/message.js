const { getSession, getUserIdByThreadTs } = require("../db");
const {
  postDMToThread,
  postThreadMessageToDM,
  welcome,
  noSession,
  noUnderstand
} = require("../actions/message");
const { getMentorRequestChannelId } = require("../actions/channel");

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
      // if (event.blocks && event.blocks[0].block_id === 'mentor_request') {
      //   // record timestamp and DM channel so there's a reference for threads
      //   createSession(event.user, event.blocks[1].block_id, event.event_ts);
      // }
    } else {
      // send thread message to DM
      const user = getUserIdByThreadTs(event.thread_ts);
      const { channel, source_ts } = getSession(user);
      if (user) {
        postThreadMessageToDM(
          event.channel,
          event.ts,
          channel,
          source_ts,
          event.text,
          user
        );
      }
    }
  } else if (event.channel_type === "im") {
    // DM's
    const user = getSession(event.user);
    if (!event.subtype && user != null && user.ts != null && user.source_ts === event.thread_ts) {
      // user messages
      // if the user has a request, post DM's to the thread
      postDMToThread(
        event.channel,
        event.ts,
        getMentorRequestChannelId(),
        user.ts,
        event.text
      );
    } else {
      if (user != null) {
        if (user.ts != null) {
          noUnderstand(event.channel);
        } else {
          noSession(event.channel);
        }
      } else {
        welcome(event.user, event.channel);
      }
    }
  }
};

module.exports = messageHandler;
