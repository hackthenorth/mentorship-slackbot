const { web } = require("../clients");

const { BOT_USERNAME } = require("../../config");

const Text = require("../text");

const { getMentorRequestChannelId } = require("../actions/channel");

const mentor_group_channel = getMentorRequestChannelId();

const postThreadMessageToDM = (session, source_ts, text) => {
  web.chat
    .postMessage({
      channel: session.channel,
      text,
      thread_ts: session.mentee_ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `@${session.username}: ` + text
          }
        }
      ],
      as_user: true
    })
    .then(() => {
      web.reactions.add({
        name: "airplane_departure",
        channel: mentor_group_channel,
        timestamp: source_ts
      });
    });
};

const postDMToThread = (session, source_ts, text) => {
  web.chat
    .postMessage({
      channel: mentor_group_channel,
      thread_ts: session.ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text
          }
        }
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .then(() => {
      web.reactions.add({
        name: "airplane_departure",
        channel: session.channel,
        timestamp: source_ts
      });
    });
};

const buildMentorRequest = (session, intro = false) => {
  const actions =
    session.mentor != null
      ? {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: Text.MENTOR_REQUEST_CLAIMED(session.mentor)
            }
          ]
        }
      : {
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
              value: session.id
            }
          ]
        };
  return [
    {
      type: "divider"
    },
    {
      type: "context",
      block_id: "mentor_request",
      elements: [
        {
          type: "mrkdwn",
          text: Text.MENTOR_REQUEST_TITLE(session.username, session.submission)
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: Text.MENTOR_REQUEST_DETAILS(session.submission)
      }
    },
    ...(intro === true
      ? []
      : [
          actions,
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
        ])
  ];
};

const postMentorRequest = session => {
  return web.chat.postMessage({
    channel: mentor_group_channel,
    blocks: buildMentorRequest(session),
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

const confirmMentorRequest = session => {
  web.chat.update({
    channel: session.channel,
    ts: session.mentee_ts,
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
    channel: session.channel,
    text: Text.MENTEE_MESSAGE_NOTIF(session.username),
    thread_ts: session.mentee_ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.MENTEE_MESSAGE_NOTIF(session.username)
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
    as_user: true
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

const welcome = session => {
  web.chat.postMessage({
    channel: session.channel,
    text: Text.WELCOME(session.name),
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.WELCOME(session.name)
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
  });
};

const noSession = ({ channel }) => {
  web.chat
    .postMessage({
      channel,
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
const noUnderstand = ({ channel }) => {
  web.chat
    .postMessage({
      channel,
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

const sessionIntroduction = session => {
  // update the new channel
  web.chat.postMessage({
    channel: session.group_id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_INTRODUCTION(session)
        }
      },
      ...buildMentorRequest(session, true)
    ],
    as_user: true
  });

  // update the existing user message
  web.chat.update({
    channel: mentor_group_channel,
    ts: session.ts,
    blocks: buildMentorRequest(session),
    as_user: true,
    username: BOT_USERNAME
  });

  // let the mentor know
  return web.chat.postMessage({
    channel: session.mentor,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_CLAIMED(session)
        }
      },
      {
        type: "actions",
        elements: [
          {
            action_id: "surrender_request",
            type: "button",
            text: {
              type: "plain_text",
              text: Text.MENTOR_REQUEST_SURRENDER
            },
            value: session.id
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
            value: session.id
          }
        ]
      }
    ],
    as_user: true
  });
};

const sessionSurrendered = session => {
  web.chat.update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_SURRENDERED_MENTOR
        }
      }
    ],
    as_user: true
  });
  return web.chat.postMessage({
    channel: session.group_id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_SURRENDERED(session)
        }
      }
    ],
    as_user: true
  });
};

const sessionCompleted = session => {
  web.chat.update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_COMPLETED_MENTOR
        }
      }
    ],
    as_user: true
  });
  web.chat.update({
    channel: session.channel,
    ts: session.mentee_ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_COMPLETED_MENTEE
        }
      }
    ],
    as_user: true
  });
  return web.chat.postMessage({
    channel: session.group_id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: Text.SESSION_COMPLETED(session)
        }
      }
    ],
    as_user: true
  });
};

const postSessionDeleted = ({ channel, mentee_ts }) => {
  web.chat.delete({ channel, ts: mentee_ts });
  web.chat
    .postMessage({
      channel,
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
      as_user: true
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
  postThreadMessageToDM,
  sessionIntroduction,
  sessionSurrendered,
  sessionCompleted
};
