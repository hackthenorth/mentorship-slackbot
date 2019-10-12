import {
  ChatUpdateArguments,
  ChatPostMessageArguments,
  Block,
  KnownBlock
} from "@slack/web-api";

import config from "config";
import { Session, ClaimedSession } from "typings";
import { webClient } from "clients";
import * as db from "db";

const { chat } = webClient;

export type RequestContext =
  | "deleted"
  | "canceled"
  | "mentee"
  | "mentee_completed"
  | "intro"
  | null;

export type RequestSession = Session &
  Pick<ClaimedSession, "username" | "submission">;

function buildRequestActions(session: RequestSession, context: RequestContext) {
  switch (context) {
    case "deleted":
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Request has been deleted*`
          }
        }
      ];
    case "canceled":
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Request canceled by user*`
          }
        }
      ];
    case "mentee":
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Your request has been sent to mentors*`
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
                text: `Cancel Request`
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
            text: `*Your request has been marked complete*`
          }
        }
      ];
    case "intro":
      return [];
    case null:
      // Can't use `isClaimed` because `mentor_claim_ts`
      // hasn't been updated yet (see interactions.ts)
      return [
        (session as ClaimedSession).group_id != null
          ? {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Request claimed by <@${
                    (session as ClaimedSession).mentor
                  }>`
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
                    text: `Claim`
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
                    text: `Delete`
                  },
                  style: "danger",
                  value: session.id
                }
              ]
            }
      ];
  }
}

export function buildRequestBlock(
  session: RequestSession,
  context: RequestContext = null
) {
  const actions = buildRequestActions(session, context);
  let mentors: string[] = [];
  if (context == null && session.submission.skill != null) {
    const allMentors = db.getMentors();
    mentors = Object.keys(allMentors).filter(
      m => allMentors[m].skills[session.submission.skill] === true
    );
  }

  const { username, submission } = session;

  const title = `Mentorship request from @${username}\nLocation: ${
    submission.location
  }${
    submission.skill != null
      ? `\nCategory: ${config.SKILLS[submission.skill]} ${
          mentors.length > 0
            ? `(${mentors.map(m => `<@${m}>`).join(", ")})`
            : ""
        }`
      : ""
  }`;

  return {
    text: title + " " + submission.description,
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
          text: submission.description
        }
      },
      ...actions
    ]
  };
}

export function buildSimpleBlock(
  text: string,
  additionalBlocks: (KnownBlock | Block)[] = []
) {
  return {
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text }
      },
      ...additionalBlocks
    ]
  };
}

export function send(value: ChatPostMessageArguments) {
  return chat.postMessage({
    as_user: true,
    username: config.BOT_USERNAME,
    ...value
  });
}

export function update(value: ChatUpdateArguments) {
  return chat.update({
    as_user: true,
    ...value
  });
}
