const { web } = require('../clients');
const Text = require('../text');
const { BOT_USERNAME } = require('../../config');

const messageHandler = (event) => {
  // console.log(event);
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  
  // temporary welcome message for testing
  if (!event.subtype) {
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
            text: Text.NEED_MENTOR()
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: Text.NEED_MENTOR_BUTTON()
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
};

module.exports = messageHandler;