const { web } = require("../clients");

const { BOT_USERNAME } = require("../../config");

const { createSession } = require("../db");

const Text = require("../text");

const postThreadMessageToDM = (
  source_channel,
  source_ts,
  channel,
  thread_ts,
  text,
  username
) => {
  web.chat
    .postMessage({
      channel,
      text,
      thread_ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${username}>: ` + text
          }
        }
      ],
      as_user: true,
    })
    .then(() => {
      web.reactions.add({
        name: "airplane_departure",
        channel: source_channel,
        timestamp: source_ts
      });
    });
};

const postDMToThread = (
  source_channel,
  source_ts,
  channel,
  thread_ts,
  message
) => {
  web.chat
    .postMessage({
      channel,
      thread_ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message
          }
        }
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .then(() => {
      web.reactions.add({
        name: "airplane_departure",
        channel: source_channel,
        timestamp: source_ts
      });
    });
};

const postMentorRequest = (privateChannel, DMChannel, user, submission) => {
  return web.chat.postMessage({
    channel: privateChannel,
    blocks: [
      {
        type: "divider"
      },
      {
        type: "context",
        block_id: "mentor_request",
        elements: [
          {
            type: "mrkdwn",
            text: Text.MENTOR_REQUEST_TITLE(user.name, submission)
          }
        ]
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
      },
      {
        type: "context",
        block_id: "mentor_request_footer",
        elements: [
          {
            type: "mrkdwn",
            text: Text.MENTOR_REQUEST_FOOTER
          }
        ]
      }
    ],
    as_user: true,
    username: BOT_USERNAME
  });
};

const openMentorRequestDialog = (trigger_id, ts) => {
  web.dialog.open({
    trigger_id,
    dialog: {
      callback_id: "mentor_request",
      title: "Request a Mentor",
      submit_label: "Request",
      notify_on_cancel: true,
      state: ts,
      elements: [
        {
          type: "text",
          label: "Your Location",
          name: "location",
          max_length: 50
        },
        {
          type: "textarea",
          label: "Your Problem",
          name: "description",
          max_length: 500
        }
      ]
    }
  });
};

const confirmMentorRequest = (channel, ts, username) => {
  web.chat.update({
    channel,
    ts,
    text: Text.REQUEST_CONFIRM,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
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
    as_user: true,
    username: BOT_USERNAME
  });
  web.chat.postMessage({
    channel,
    text: Text.MENTEE_MESSAGE_NOTIF(username),
    thread_ts: ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.MENTEE_MESSAGE_NOTIF(username)
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: Text.MENTEE_MESSAGE_NOTIF_CONTEXT
          }
        ]
      }
    ],
    as_user: true,
  });
};

const requestActionBlock = {
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
};

const welcome = (userid, channel, name) => {
  web.chat
    .postMessage({
      channel: channel,
      text: Text.WELCOME(name),
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.WELCOME(name)
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.NEED_MENTOR
          }
        },
        requestActionBlock
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .then(() => {
      createSession(userid, channel);
    });
};

const noSession = channel => {
  web.chat
    .postMessage({
      channel: channel,
      text: Text.WELCOME(),
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: Text.NO_SESSION }
        },
        requestActionBlock
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .catch(console.error);
};
const noUnderstand = channel => {
  web.chat
    .postMessage({
      channel: channel,
      text: Text.NO_UNDERSTAND,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: Text.NO_UNDERSTAND }
        }
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .catch(console.error);
};

const needMentor = channel => {
  web.chat.postMessage({
    channel: channel,
    text: Text.NEED_MENTOR,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.NEED_MENTOR
        }
      },
      requestActionBlock
    ],
    as_user: true,
    username: BOT_USERNAME
  });
};

const postSessionDeleted = (channel, ts) => {
  web.chat.delete({ channel, ts });
  web.chat
    .postMessage({
      channel,
      ts,
      text: Text.SESSION_DELETED,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.SESSION_DELETED
          }
        }
      ],
      as_user: true,
    })
    .then(() => needMentor(channel));
};

module.exports = {
  welcome,
  needMentor,
  noSession,
  noUnderstand,
  openMentorRequestDialog,
  confirmMentorRequest,
  postMentorRequest,
  postSessionDeleted,
  postDMToThread,
  postThreadMessageToDM
};
