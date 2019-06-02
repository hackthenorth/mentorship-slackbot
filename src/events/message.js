const { web } = require('../clients');
const Text = require('../text');
const { BOT_USERNAME } = require('../../config');
const { getThreads, addThread } = require('../db');

let welcomed = false;

const messageHandler = ({ channel, channel_type, subtype, ts, thread_ts, text }) => {
  console.log(event);
  // console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  
  if (channel_type === 'group') { // private channel
    // record timestamp so there's a reference for threads
    const threads = getThreads();
    console.log(threads);
    if (threads.includes(ts)) {
      console.log("includes ts");
    } else {
      addThreads(ts);
    }

  } else if (channel_type === 'im') { // DM
    if (welcomed) {
      postMessageToThread(channel, thread_ts, text);
    }

    // temporary welcome message for testing
    if (!subtype) {
      welcomed = true;
      web.chat.postMessage({ 
        channel,
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