const { web } = require('../clients');

const { BOT_USERNAME } = require('../../config');

const Text = require('../text');

const postThreadMessageToDM = (channel, text) => {
  web.chat.postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: Text.MENTOR_MESSAGE_NOTIF
        }
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text
        }
      }
    ]
  });
}

const postDMToThread = (channel, thread_ts, message) => {
  web.chat.postMessage({
    channel,
    thread_ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: Text.MENTEE_MESSAGE_NOTIF
        }
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text: message
        }
      }
    ],
    as_user: false, 
    username: BOT_USERNAME 
  }).catch(console.error);
};

const postMentorRequest = (privateChannel, DMChannel, user, submission) => {
  web.chat.postMessage({
    channel: privateChannel,
    blocks: [
      {
        type: "section",
        block_id: "mentor_request",
        text: {
          type: "plain_text",
          text: Text.MENTOR_REQUEST_TITLE(user.name)
        }
      },
      {
        type: "section",
        block_id: DMChannel,
        text: {
          type: "mrkdwn",
          text: Text.MENTOR_REQUEST_DETAILS(submission)
        }
      },
      {
        type: "actions",
        elements: [
          {
            action_id: "claim_request",
            type: "button",
            text: {
              type: "plain_text",
              text: Text.MENTOR_REQUEST_CONFIRM
            },
            style: "primary",
            value: "claim"
          },
          {
            action_id: "delete_request",
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: Text.MENTOR_REQUEST_DELETE
            },
            style: "danger",
            value: "delete"
          }
        ]
      }
    ],
    as_user: false, 
    username: BOT_USERNAME 
  }).catch(console.error);
};

const openMentorRequestDialog = (trigger_id) => {
  web.dialog.open({
    trigger_id,
    dialog: {
      callback_id: "mentor_request",
      title: "Request a Mentor",
      submit_label: "Request",
      notify_on_cancel: true,
      elements: [
        {
          "type": "text",
          "label": "Your Problem",
          "name": "description"
        },
        {
          "type": "text",
          "label": "Your Location",
          "name": "location"
        }
      ]
    }
  }).catch(console.error);
};

const confirmMentorRequest = (channel) => {
  web.chat.postMessage({ 
    channel,
    text: {
      type: "plain_text",
      text: Text.REQUEST_CONFIRM
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: Text.REQUEST_CONFIRM
        }
      },
      {
        type: "actions",
        elements: [
          {
            action_id: "cancel_request",
            type: "button",
            text: {
              type: "plain_text",
              text: Text.CANCEL_REQUEST_BUTTON
            }
          }
        ]
      }
    ],
    as_user: false, 
    username: BOT_USERNAME })
      .catch(console.error);
}

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
          "text": Text.NEED_MENTOR
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": Text.NEED_MENTOR_BUTTON
            }
          }
        ]
      }
    ],
    as_user: false, 
    username: BOT_USERNAME })
      .catch(console.error);
}

module.exports = {
  welcome,
  openMentorRequestDialog,
  confirmMentorRequest,
  postMentorRequest,
  postDMToThread,
  postThreadMessageToDM
};