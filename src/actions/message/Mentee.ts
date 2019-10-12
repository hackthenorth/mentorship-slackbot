import Config from "config";
import { ActiveSession, ClaimedSession, Session, TS } from "typings";
import { webClient } from "clients";
import {
  buildSimpleBlock,
  buildRequestBlock,
  RequestContext,
  RequestSession,
  update,
  send
} from "./utils";

const requestActionBlock = {
  type: "actions",
  elements: [
    {
      action_id: "need_mentor",
      type: "button",
      text: {
        type: "plain_text",
        text: `I need a mentor`
      },
      value: "needMentor"
    }
  ]
};

export function updateRequest(
  session: RequestSession & Pick<ClaimedSession, "mentee_ts">,
  context: RequestContext = "mentee"
) {
  return update({
    channel: session.channel,
    ts: session.mentee_ts,
    ...buildRequestBlock(session, context)
  });
}

export function welcome(session: Session) {
  const text = `Hi ${
    session.name ? session.name : "hacker"
  }, welcome to Hack the North 2019! :wave:

  I’m Mentorship Bot, here to help you
  find a mentor at any time during the
  event.`;
  return send({
    channel: session.channel,
    ...buildSimpleBlock(text, [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Need a mentor? Simply click the button below.`
        }
      },
      requestActionBlock
    ])
  });
}

export function noSession({ channel }: Session) {
  const text = `You do not currently have a mentorship session active.`;
  return send({
    channel,
    ...buildSimpleBlock(text, [requestActionBlock])
  });
}

export function noUnderstand({ channel }: Session) {
  const text = `Sorry, I am not equipped to deal with messages.`;
  return send({
    channel,
    ...buildSimpleBlock(text)
  });
}

export function needMentor({ channel }: Session) {
  const text = `Need a mentor? Simply click the button below.`;
  send({
    channel: channel,
    ...buildSimpleBlock(text, [requestActionBlock])
  });
}

export function deleted({ channel }: ActiveSession) {
  const text = `Your mentorship request was deleted by a mentor - if you believe this was a mistake, please make a new request or contact our mentorship lead ${Config.MENTOR_LEAD}`;
  return send({
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
  });
}

export function openRequestDialog(trigger_id: string, ts: TS) {
  return webClient.dialog.open({
    trigger_id,
    dialog: {
      callback_id: "mentor_request",
      title: `Request a Mentor`,
      submit_label: `Request`,
      notify_on_cancel: true,
      state: ts,
      elements: [
        {
          type: "text",
          label: `Your Location`,
          name: "location",
          max_length: 50
        },
        {
          label: `Choose a category`,
          name: "skill",
          type: "select",
          optional: true,
          options: Object.keys(Config.SKILLS).map(value => ({
            label: Config.SKILLS[value],
            value
          }))
        },
        {
          type: "textarea",
          label: `Your Problem`,
          name: "description",
          max_length: 500
        }
      ]
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function alreadyActive(respond: (message: any) => Promise<unknown>) {
  const text = `You already have an active mentorship session`;
  return respond({ text });
}
