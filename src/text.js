module.exports = {
  WELCOME: (member) => 
`Hi ${member ? member.profile.first_name : 'hacker'}, welcome to Hack the North 2019! :wave:

I’m Mentorship Bot, here to help you
find a mentor at any time during the
event.`,
  NEED_MENTOR: "Need a mentor? Simply click the button below.",
  NEED_MENTOR_BUTTON: "I need a mentor",
  REQUEST_CONFIRM: "Got it - I have passed on your request to the mentors",
  CANCEL_REQUEST_BUTTON: "Cancel Reqeust"
};