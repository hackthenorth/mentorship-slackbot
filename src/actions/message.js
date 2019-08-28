const { web } = require("../clients");

const db = require("../db");

const { BOT_USERNAME, SKILLS } = require("../../config");

const Text = require("../text");

const { getMentorRequestChannelId } = require("../actions/channel");

const mentor_group_channel = getMentorRequestChannelId();

const buildMentorRequestActions = (session, context) => {
  const footer = {
    type: "context",
    block_id: "mentor_request_footer",
    elements: [
      {
        type: "mrkdwn",
        text: Text.MENTOR_REQUEST_FOOTER
      }
    ]
  };
  switch (context) {
    case "deleted":
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.MENTOR_REQUEST_DELETED
          }
        }
      ];
    case "canceled":
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.MENTOR_REQUEST_CANCELED
          }
        }
      ];
    case "mentee":
      return [
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
      ];
    case "mentee_completed":
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.SESSION_COMPLETED_MENTEE
          }
        }
      ];
    case "intro":
      return [];
    case null:
      return [
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
            },
        footer
      ];
  }
};

const buildMentorRequest = (session, context = null) => {
  const actions = buildMentorRequestActions(session, context);
  let mentors = [];
  if (context == null && session.submission.skill != null) {
    const allMentors = db.getMentors();
    mentors = Object.keys(allMentors).filter(m => allMentors[m].skills[session.submission.skill] === true);
  } 
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
          text: Text.MENTOR_REQUEST_TITLE(session.username, session.submission, mentors)
        },
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: Text.MENTOR_REQUEST_DETAILS(session.submission)
      }
    },
    ...actions
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
          label: "Choose a category",
          name: "skill",
          type: "select",
          optional: true,
          options: Object.keys(SKILLS).map(
            value => ({
              label: SKILLS[value],
              value
            })
          )
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
    blocks: buildMentorRequest(session, "mentee"),
    as_user: true,
    username: BOT_USERNAME
  });
};

const bumpMentorRequest = session => {
  web.chat
    .getPermalink({
      channel: mentor_group_channel,
      message_ts: session.ts
    })
    .then(({ permalink }) => {
      web.chat.postMessage({
        channel: mentor_group_channel,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: Text.BUMP(permalink, session)
            }
          }
        ],
        unfurl_links: true,
        as_user: true,
        username: BOT_USERNAME
      });
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
      text: Text.NO_SESSION,
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
const noUnderstandMentor = (channel) => {
  web.chat
    .postMessage({
      channel,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: Text.NO_UNDERSTAND_MENTOR }
        }
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .catch(console.error);
};

const needMentor = ({ channel }) => {
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
      ...buildMentorRequest(session, "intro")
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
            action_id: "complete_request",
            type: "button",
            text: {
              type: "plain_text",
              text: Text.MENTOR_REQUEST_COMPLETE
            },
            style: "primary",
            value: session.id
          },
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

const sessionSurrendered = (session, newSession) => {
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
  web.chat.update({
    channel: mentor_group_channel,
    ts: session.ts,
    blocks: buildMentorRequest(newSession),
    as_user: true,
    username: BOT_USERNAME
  });
  web.chat
    .getPermalink({
      channel: mentor_group_channel,
      message_ts: session.ts
    })
    .then(({ permalink }) => {
      web.chat.postMessage({
        channel: mentor_group_channel,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: Text.BUMP_SURRENDER(permalink, session)
            }
          }
        ],
        unfurl_links: true,
        as_user: true,
        username: BOT_USERNAME
      });
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
    blocks: buildMentorRequest(session, "mentee_completed"),
    as_user: true,
    username: BOT_USERNAME
  });
  noSession(session);
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

const postSessionCanceled = session => {
  web.chat.update({
    channel: session.channel,
    ts: session.mentee_ts,
    blocks: buildMentorRequest(session, "canceled"),
    as_user: true,
    username: BOT_USERNAME
  });
  web.chat.update({
    channel: mentor_group_channel,
    ts: session.ts,
    blocks: buildMentorRequest(session, "canceled"),
    as_user: true,
    username: BOT_USERNAME
  });
};

const postSessionDeleted = session => {
  const { channel, mentor_channel, mentee_ts, mentor_claim_ts, ts } = session;
  web.chat.update({
    channel: mentor_group_channel,
    ts: ts,
    blocks: buildMentorRequest(session, "deleted"),
    as_user: true,
    username: BOT_USERNAME
  });
  if (mentor_claim_ts != null) {
    web.chat.update({
      channel: mentor_channel,
      ts: mentor_claim_ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: Text.SESSION_DELETED_MENTOR
          }
        }
      ],
      as_user: true
    });
  }
  web.chat.update({
    channel,
    ts: mentee_ts,
    blocks: buildMentorRequest(session, "deleted"),
    as_user: true,
    username: BOT_USERNAME
  });
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
    .then(() => needMentor(session));
};

const skillsHelp = (channel) => {
  web.chat
    .postMessage({
      channel,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: Text.SKILLS_HELP(Object.keys(SKILLS)) }
        }
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .catch(console.error);
};

const skillsSet = (channel, newSkills) => {
  web.chat
    .postMessage({
      channel,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: Text.SKILLS_SET(newSkills) }
        }
      ],
      as_user: true,
      username: BOT_USERNAME
    })
    .catch(console.error);
};


module.exports = {
  welcome,
  needMentor,
  noSession,
  noUnderstand,
  noUnderstandMentor,
  openMentorRequestDialog,
  confirmMentorRequest,
  postMentorRequest,
  postSessionDeleted,
  postSessionCanceled,
  postDMToThread,
  postThreadMessageToDM,
  sessionIntroduction,
  sessionSurrendered,
  sessionCompleted,
  bumpMentorRequest,
  skillsHelp,
  skillsSet,
};
