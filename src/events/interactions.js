const Text = require("../text");

const {
  openMentorRequestDialog,
  confirmMentorRequest,
  postMentorRequest,
  postSessionClaimed,
  postSessionDeleted,
  needMentor
} = require("../actions/message");
const { getMentorRequestChannelId } = require("../actions/channel");

const { web } = require('../clients');

const { createSession, getSession, clearSession, getUserIdByThreadTs} = require("../db");

const handleNeedMentor = (payload, respond) => {
  // check for existing session
  const session = getSession(payload.user.id);
  if (session.ts != null) {
    respond({
      text: Text.SESSION_ALREADY_ACTIVE
    });
  } else {
    // send problem prompt text
    openMentorRequestDialog(payload.trigger_id, payload.message.ts);
  }
};

const handleMentorRequest = async payload => {
  const { user, channel, submission, state } = payload;
  // validate user and submission
  // save problem and location
  // start request reminder timer
  // send request to private channel
  const mentorChannelId = getMentorRequestChannelId();
  if (mentorChannelId) {
    postMentorRequest(mentorChannelId, channel.id, user, submission)
    .then(({ ts }) => {
      createSession(user.id, channel.id, ts, state);
      confirmMentorRequest(channel.id, state, user.name);
    });
  }
};

const handleCancelRequest = ({user: {id}}, respond) => {
  respond({
    text: "Your request was canceled"
  });
  const { channel, ts } = getSession(id);
  web.chat.delete({ channel: getMentorRequestChannelId(), ts });
  clearSession(id);
  needMentor(channel);

  // respond in private mentor channel
};

const handleClaimRequest = (payload, respond) => {
  const userId = getUserIdByThreadTs(payload.message.ts);
  const { channel, source_ts } = getSession(userId);
  postSessionClaimed(channel, source_ts);
};

const handleDeleteRequest = (payload, respond) => {
  const userId = getUserIdByThreadTs(payload.message.ts);
  const { channel, source_ts } = getSession(userId);
  web.chat.delete({ channel: getMentorRequestChannelId(), ts: payload.message.ts });
  postSessionDeleted(channel, source_ts);
  clearSession(userId);
  // respond in DM
};

const bootstrap = interactions => {
  interactions.action({ actionId: "need_mentor" }, handleNeedMentor);
  interactions.action({ callbackId: "mentor_request" }, handleMentorRequest);
  interactions.action({ actionId: "cancel_request" }, handleCancelRequest);
  interactions.action({ actionId: "claim_request" }, handleClaimRequest);
  interactions.action({ actionId: "delete_request" }, handleDeleteRequest);
};

module.exports = { bootstrap };
