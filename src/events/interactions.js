const Text = require('../text');
const { openMentorRequest, confirmMentorRequest, postMentorRequest } = require('../actions/message');
const { getMentorRequestChannelId } = require('../actions/channel');

const handleNeedMentor = (payload, respond) => {
  console.log(payload.trigger_id);
  // initialize request for user

  // send problem prompt text
  openMentorRequest(payload.trigger_id);
};

const handleMentorRequest = async (payload, respond) => {
  console.log("GOT MENTOR REQUEST");
  console.log(payload);
  const { user, channel, submission } = payload;
  // validate user and submission
  // save problem and location
  // start request reminder timer
  // send request to private channel
  const mentorChannelId = getMentorRequestChannelId();
  if (mentorChannelId) {
    postMentorRequest(mentorChannelId, user, submission);
  }

  // respond with confirmation
  confirmMentorRequest(channel.id);
};

const handleCancelRequest = (payload, respond) => {
  respond({
    text: "Your request was canceled"
  });
  // respond in private mentor channel
};

const handleClaimRequest = (payload, respond) => {

};

const handleDeleteRequest = (payload, respond) => {
  respond({
    text: "This request has been deleted"
  });
  // respond in DM
};

const bootstrap = (interactions) => {
  interactions.action({ actionId: 'need_mentor'}, handleNeedMentor);
  interactions.action({ callbackId: 'mentor_request'}, handleMentorRequest);
  interactions.action({ actionId: 'cancel_request'}, handleCancelRequest );
  interactions.action({ actionId: 'claim_request'}, handleClaimRequest );
  interactions.action({ actionId: 'delete_request'}, handleDeleteRequest );
};

module.exports = { bootstrap };