const { web } = require('../clients');
const Text = require('../text');
const { BOT_USERNAME } = require('../../config');
const { setChannelWithTimestamp, getChannelByTimestamp, getTimestampByChannel } = require('../db');
const { postDMToThread, postThreadMessageToDM } = require('../actions/message');
const { getMentorRequestChannelId } = require('../actions/channel');

let welcomed = false;

const messageHandler = (event) => {
  // console.log(event);
  // console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  
  if (event.channel_type === 'group') { // private channel messages
    if (event.subtype === 'bot_message') {
      if (event.blocks && event.blocks[0].block_id === 'mentor_request') {
        // record timestamp and DM channel so there's a reference for threads
        setChannelWithTimestamp(event.blocks[1].block_id, event.event_ts);
      }
    } else {
      // send thread message to DM
      const { channel } = getChannelByTimestamp(event.thread_ts);
      if (channel) {
        postThreadMessageToDM(channel, event.text);
      }
    }
  } else if (event.channel_type === 'im') { // DM's
    if (welcomed && !event.subtype) { // user messages
      // if the user has a request, post DM's to the thread
      const { ts } = getTimestampByChannel(event.channel);
      if (ts) postDMToThread(getMentorRequestChannelId(), ts, event.text);
    }

    // temporary welcome message for testing
    if (!event.subtype && !welcomed) { // bot messages
      welcomed = true;
      web.chat.postMessage({ 
        channel: event.channel,
        text: {
          type: "plain_text",
          text: Text.WELCOME()
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: Text.WELCOME()
            },
          },
          {
            type: "section",
            text: {
              type: "plain_text",
              text: Text.NEED_MENTOR
            }
          },
          {
            type: "actions",
            elements: [
              {
                action_id: "need_mentor",
                type: "button",
                text: {
                  type: "plain_text",
                  text: Text.NEED_MENTOR_BUTTON
                },
                value: "needMentor"
              }
            ]
          }
        ],
        as_user: false, 
        username: BOT_USERNAME })
          .catch(console.error);
    }
  }
};

module.exports = messageHandler;