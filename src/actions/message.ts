import config from "config";

import { webClient } from "clients";
import * as db from "db";
import Text from "text";
import {
  ActiveSession,
  isClaimed,
  TS,
  Session,
  ChannelID,
  ClaimedSession,
  UserID,
  Skills
} from "typings";
import { ChatUpdateArguments, ChatPostMessageArguments } from "@slack/web-api";

export const { chat, dialog } = webClient;

export const MENTOR_GROUP_CHANNEL = config.CHANNEL_ID;

type Context =
  | "deleted"
  | "canceled"
  | "mentee"
  | "mentee_completed"
  | "intro"
  | null;

function postMessage(value: ChatPostMessageArguments) {
  return chat.postMessage({
    as_user: true,
    username: config.BOT_USERNAME,
    ...value
  });
}
function update(value: ChatUpdateArguments) {
  return chat.update({
    as_user: true,
    ...value
  });
}

export const buildMentorRequestActions = (
  session: ActiveSession,
  context: Context
) => {
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
        isClaimed(session)
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
            }
      ];
  }
};

export const buildMentorRequest = (
  session: ActiveSession,
  context: Context = null
) => {
  const actions = buildMentorRequestActions(session, context);
  let mentors: string[] = [];
  if (context == null && session.submission.skill != null) {
    const allMentors = db.getMentors();
    mentors = Object.keys(allMentors).filter(
      m => allMentors[m].skills[session.submission.skill] === true
    );
  }

  const title = Text.MENTOR_REQUEST_TITLE(
    session.username,
    session.submission,
    mentors
  );
  const details = Text.MENTOR_REQUEST_DETAILS(session.submission);

  return {
    text: title + " " + details,
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
            text: title
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: details
        }
      },
      ...actions
    ]
  };
};

export const postMentorRequest = (session: ActiveSession) => {
  return postMessage({
    channel: MENTOR_GROUP_CHANNEL,
    ...buildMentorRequest(session)
  });
};

export const openMentorRequestDialog = (trigger_id: string, ts: TS) => {
  dialog.open({
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
          options: Object.keys(config.SKILLS).map(value => ({
            label: config.SKILLS[value],
            value
          }))
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

export const confirmMentorRequest = (session: ActiveSession) => {
  update({
    channel: session.channel,
    ts: session.mentee_ts,
    ...buildMentorRequest(session, "mentee")
  });
};

export const bumpMentorRequest = (session: ActiveSession) => {
  chat
    .getPermalink({
      channel: MENTOR_GROUP_CHANNEL,
      message_ts: session.ts
    })
    .then(({ permalink }) => {
      const text = Text.BUMP(permalink as string, session);
      postMessage({
        channel: MENTOR_GROUP_CHANNEL,
        text,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text
            }
          }
        ],
        unfurl_links: true
      });
    });
};

export const requestActionBlock = {
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

export const welcome = (session: Session) => {
  const text = Text.WELCOME(session.name);
  postMessage({
    channel: session.channel,
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text
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
    ]
  });
};

export const noSession = ({ channel }: Session) => {
  const text = Text.NO_SESSION;
  postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text }
      },
      requestActionBlock
    ]
  }).catch(console.error);
};
export const noUnderstand = ({ channel }: Session) => {
  const text = Text.NO_UNDERSTAND;
  postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text }
      }
    ]
  }).catch(console.error);
};
export const noUnderstandMentor = (channel: ChannelID) => {
  const text = Text.NO_UNDERSTAND_MENTOR;
  postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text }
      }
    ]
  }).catch(console.error);
};

export const needMentor = ({ channel }: Session) => {
  postMessage({
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
    ]
  });
};

export const sessionIntroduction = (session: ClaimedSession) => {
  const { blocks } = buildMentorRequest(session, "intro");
  const introText = Text.SESSION_INTRODUCTION(session);
  // update the new channel
  postMessage({
    channel: session.group_id,
    text: introText,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: introText
        }
      },
      ...blocks
    ]
  });

  // update the existing user message
  update({
    channel: MENTOR_GROUP_CHANNEL,
    ts: session.ts,
    ...buildMentorRequest(session)
  });

  // let the mentor know
  const mentorText = Text.SESSION_CLAIMED(session);
  return postMessage({
    channel: session.mentor,
    text: mentorText,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: mentorText
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
    ]
  });
};

export const sessionSurrendered = (
  session: ClaimedSession,
  newSession: ActiveSession
) => {
  const mentorText = Text.SESSION_SURRENDERED_MENTOR;
  update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    text: mentorText,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: mentorText
        }
      }
    ]
  });
  update({
    channel: MENTOR_GROUP_CHANNEL,
    ts: session.ts,
    ...buildMentorRequest(newSession)
  });
  chat
    .getPermalink({
      channel: MENTOR_GROUP_CHANNEL,
      message_ts: session.ts
    })
    .then(({ permalink }) => {
      const text = Text.BUMP_SURRENDER(permalink as string, session);
      postMessage({
        channel: MENTOR_GROUP_CHANNEL,
        text,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text
            }
          }
        ],
        unfurl_links: true
      });
    });
  const text = Text.SESSION_SURRENDERED(session);
  return postMessage({
    channel: session.group_id,
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text
        }
      }
    ]
  });
};

export const sessionCompleted = (session: ClaimedSession) => {
  const mentorText = Text.SESSION_COMPLETED_MENTOR;
  update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    text: mentorText,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: mentorText
        }
      }
    ]
  });
  update({
    channel: session.channel,
    ts: session.mentee_ts,
    ...buildMentorRequest(session, "mentee_completed")
  });
  noSession(session);
  const text = Text.SESSION_COMPLETED(session);
  return postMessage({
    channel: session.group_id,
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text
        }
      }
    ]
  });
};

export const postSessionCanceled = (session: ActiveSession) => {
  update({
    channel: session.channel,
    ts: session.mentee_ts,
    ...buildMentorRequest(session, "canceled")
  });
  update({
    channel: MENTOR_GROUP_CHANNEL,
    ts: session.ts,
    ...buildMentorRequest(session, "canceled")
  });
};

export const postSessionDeleted = (session: ActiveSession) => {
  const { channel, mentee_ts, ts } = session;
  update({
    channel: MENTOR_GROUP_CHANNEL,
    ts: ts,
    ...buildMentorRequest(session, "deleted")
  });
  if (isClaimed(session)) {
    const mentorText = Text.SESSION_DELETED_MENTOR;
    update({
      channel: session.mentor_channel,
      ts: session.mentor_claim_ts,
      text: mentorText,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: mentorText
          }
        }
      ]
    });
  }
  chat.update({
    channel,
    ts: mentee_ts,
    ...buildMentorRequest(session, "deleted")
  });
  const text = Text.SESSION_DELETED;
  postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text
        }
      }
    ]
  }).then(() => needMentor(session));
};

export const skillsHelp = (channel: ChannelID) => {
  const text = Text.SKILLS_HELP(Object.keys(config.SKILLS));
  postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text }
      }
    ]
  }).catch(console.error);
};

export const skillsSet = (channel: UserID, newSkills: Skills) => {
  const text = Text.SKILLS_SET(newSkills);
  postMessage({
    channel,
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text }
      }
    ]
  }).catch(console.error);
};

export const stats = (stats: { created: number; online: number }) => {
  const text = Text.STATS(stats);
  postMessage({
    channel: config.STATS_CHANNEL_ID,
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text
        }
      }
    ]
  });
};
