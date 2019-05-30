const { web } = require('../clients');

const { BOT_USERNAME } = require('../../config');

const Text = require('../text');

const welcome = (member) => {
  web.chat.postMessage({ 
    channel: event.channel,
    text: {
      type: "plain_text",
      text: Text.WELCOME(member)
    },
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": Text.WELCOME(member)
        }
      },
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": Text.NEED_MENTOR()
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": Text.NEED_MENTOR_BUTTON()
            }
          }
        ]
      }
    ],
    as_user: false, 
    username: BOT_USERNAME })
      .catch(console.error);
}

module.exports = { welcome };