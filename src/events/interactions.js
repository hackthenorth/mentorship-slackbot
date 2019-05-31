const Text = require('../text');
const { openMentorRequest, confirmMentorRequest } = require('../actions/message');
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
  // validate user
  // save problem and location
  // send request to private channel
  const mentorChannelId = getMentorRequestChannelId();
  console.log(mentorChannelId);

  // respond with confirmation
  confirmMentorRequest(channel.id);
}

const bootstrap = (interactions) => {
  interactions.action({ actionId: 'need_mentor'}, handleNeedMentor);
  interactions.action({ callbackId: 'mentor_request'}, handleMentorRequest);
};

module.exports = { bootstrap };