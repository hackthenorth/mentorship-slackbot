import { serializeError } from "serialize-error";

import Config from "config";
import {
  ActiveSession,
  ChannelID,
  ClaimedSession,
  UserID,
  Skills
} from "typings";
import { webClient } from "clients";
import {
  buildSimpleBlock,
  buildRequestBlock,
  RequestContext,
  RequestSession,
  update,
  send
} from "./util";

const { MENTOR_CHANNEL } = Config;

// =======================
// === Mentors Channel ===
// =======================

export function sendRequest(session: RequestSession) {
  return send({
    channel: MENTOR_CHANNEL,
    ...buildRequestBlock(session)
  });
}

export function updateRequest(
  session: RequestSession & Pick<ActiveSession, "ts">,
  context: RequestContext = null
) {
  return update({
    channel: MENTOR_CHANNEL,
    ts: session.ts,
    ...buildRequestBlock(session, context)
  });
}

export function bump(session: ActiveSession) {
  return webClient.chat
    .getPermalink({
      channel: MENTOR_CHANNEL,
      message_ts: session.ts
    })
    .then(({ permalink }) => {
      const text = `<@${session.id}>'s <${permalink}|mentorship request${
        session.submission.skill != null
          ? ` regarding ${session.submission.skill}`
          : ""
      }> has not received any attention recently. Please take a look!`;

      return send({
        channel: MENTOR_CHANNEL,
        ...buildSimpleBlock(text),
        unfurl_links: true
      });
    });
}

export function surrenderBump(session: ActiveSession) {
  return webClient.chat
    .getPermalink({
      channel: MENTOR_CHANNEL,
      message_ts: session.ts
    })
    .then(({ permalink }) => {
      const text = `<@${session.id}>'s <${permalink}|mentorship request${
        session.submission.skill != null
          ? ` regarding ${session.submission.skill}`
          : ""
      }> *was surrendered*. Someone please take a look!`;
      return send({
        channel: MENTOR_CHANNEL,
        ...buildSimpleBlock(text),
        unfurl_links: true
      });
    });
}

// ================
// === Controls ===
// ================

export function claimControls({ id, mentor }: ClaimedSession) {
  const text = `Thank you for claiming <@${id}>'s request ️❤️. Please use this message to manage this session.`;
  return send({
    channel: mentor,
    ...buildSimpleBlock(text, [
      {
        type: "actions",
        elements: [
          {
            action_id: "complete_request",
            type: "button",
            text: {
              type: "plain_text",
              text: `Mark Complete`
            },
            style: "primary",
            value: id
          },
          {
            action_id: "surrender_request",
            type: "button",
            text: {
              type: "plain_text",
              text: `Surrender`
            },
            value: id
          },
          {
            action_id: "delete_request",
            type: "button",
            text: {
              type: "plain_text",
              text: `Delete`
            },
            style: "danger",
            value: id
          }
        ]
      }
    ])
  });
}

export function surrenderControls(session: ClaimedSession) {
  const text = `You have surrendered the session`;
  return update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    ...buildSimpleBlock(text)
  });
}

export function completeControls(session: ClaimedSession) {
  const text = `Your session has has been marked complete`;
  return update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    ...buildSimpleBlock(text)
  });
}

export function deleteControls(session: ClaimedSession) {
  const text = `This mentorship request has been deleted`;
  return update({
    channel: session.mentor_channel,
    ts: session.mentor_claim_ts,
    ...buildSimpleBlock(text)
  });
}

// ==============
// === Skills ===
// ==============

export function noUnderstand(channel: ChannelID) {
  const text = `Sorry, I don't understand your message. Try \`!skills help\` to see and set your skills`;
  send({
    channel,
    ...buildSimpleBlock(text)
  });
}
export function skillsHelp(channel: ChannelID) {
  const text = `Set your skills so we can notify you when a relevant request comes in!

You can set your skills with the command
\`\`\`
!skills [skill1] [skill2] ...
\`\`\`

*The available skills are:*

${Object.keys(Config.SKILLS).join("\n")}`;

  return send({
    channel,
    text,
    ...buildSimpleBlock(text)
  });
}

export function skillsSet(channel: UserID, skills: Skills) {
  const text = `You have successfully set your skills to
\`\`\`
${skills.length > 0 ? `[\n  ${skills.join(",\n  ")}\n]` : `[None]`}
\`\`\`
`;
  return send({
    channel,
    ...buildSimpleBlock(text)
  });
}

// Reporting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportError(e: any) {
  const text = `The bot has encountered an error (cc ${Config.MENTOR_LEAD}): \n
\`\`\`
${serializeError(e)}
\`\`\``;
  return send({
    channel: MENTOR_CHANNEL,
    ...buildSimpleBlock(text)
  });
}
