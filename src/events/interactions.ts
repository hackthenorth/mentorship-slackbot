import SlackMessageAdapter from "@slack/interactive-messages/dist/adapter";

import Text from "text";
import * as message from "actions/message";
import { webClient } from "clients";

import {
  bumpCreated,
  getSession,
  clearSession,
  getUserIdByThreadTs,
  updateSession
} from "db";

import {
  UserID,
  ChannelID,
  Submission,
  TS,
  coerceActive,
  coerceClaimed,
  ActiveSession,
  ClaimedSession,
  isActive
} from "typings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Respond = (message: any) => Promise<unknown>;
interface ActionPayload {
  channel: {
    id: ChannelID;
  };
  trigger_id: string;
  user: {
    name: string;
    id: UserID;
  };
}
interface MessagePayload extends ActionPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: any;
  message: {
    ts: string;
  };
}
interface DialogPayload extends ActionPayload {
  state: string;
  submission: Submission;
}

const handleNeedMentor = (payload: MessagePayload, respond: Respond) => {
  // check for existing session
  const session = getSession(payload.user.id);
  if (isActive(session)) {
    respond({
      text: Text.SESSION_ALREADY_ACTIVE
    });
  } else {
    // send problem prompt text
    message.openMentorRequestDialog(payload.trigger_id, payload.message.ts);
  }
};

const handleMentorRequest = (payload: DialogPayload) => {
  const { user, channel, submission, state } = payload;
  const session = updateSession(user.id, {
    username: user.name,
    channel: channel.id,
    mentee_ts: state,
    submission
  });
  message
    .postMentorRequest(session as ActiveSession)
    .then(({ ts }) =>
      message.confirmMentorRequest(
        coerceActive(updateSession(user.id, { ts: ts as TS }))
      )
    );
  bumpCreated();
};

const handleCancelRequest = ({ user: { id } }: MessagePayload) => {
  const session = coerceActive(getSession(id), true);
  message.postSessionCanceled(session);
  clearSession(id);
  message.needMentor(session);
};

const handleClaimRequest = (payload: MessagePayload) => {
  const userId = getUserIdByThreadTs(payload.message.ts);

  if (userId === undefined)
    throw new Error(`Undefined user_id for ts '${payload.message.ts}'`);

  const session = updateSession(userId, {
    mentor: payload.user.id
  }) as ClaimedSession;

  webClient.conversations
    .open({
      users: [session.id, session.mentor].join(",")
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(({ channel: { id } }: any) => {
      message
        .sessionIntroduction(updateSession(session.id, {
          group_id: id
        }) as ClaimedSession)
        .then(({ ts, channel }) =>
          coerceClaimed(
            updateSession(userId, {
              mentor_claim_ts: ts as TS,
              mentor_channel: channel as ChannelID
            })
          )
        );
    });
};

const handleDeleteRequest = (payload: MessagePayload) => {
  const userId = payload.actions[0].value;
  const session = coerceActive(getSession(userId), true);
  message.postSessionDeleted(session);
  clearSession(userId);
};

const handleSurrenderRequest = (payload: MessagePayload) => {
  const userId = payload.actions[0].value;
  const session = coerceClaimed(getSession(userId));
  message.sessionSurrendered(
    session,
    coerceActive(
      updateSession(userId, {
        mentor_claim_ts: undefined,
        group_id: undefined,
        mentor: undefined
      })
    )
  );
};

const handleCompleteRequest = (payload: MessagePayload) => {
  const userId = payload.actions[0].value;
  const session = coerceClaimed(getSession(userId));
  message.sessionCompleted(session).then(() => {
    clearSession(userId);
  });
};

export const bootstrap = (interactions: SlackMessageAdapter) => {
  interactions.action({ actionId: "need_mentor" }, handleNeedMentor);
  interactions.action({ callbackId: "mentor_request" }, handleMentorRequest);
  interactions.action({ actionId: "cancel_request" }, handleCancelRequest);
  interactions.action({ actionId: "claim_request" }, handleClaimRequest);
  interactions.action({ actionId: "delete_request" }, handleDeleteRequest);
  interactions.action(
    { actionId: "surrender_request" },
    handleSurrenderRequest
  );
  interactions.action({ actionId: "complete_request" }, handleCompleteRequest);
};
