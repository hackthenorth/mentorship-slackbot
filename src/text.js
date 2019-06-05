module.exports = {
  WELCOME: (member) => 
`Hi ${member ? member.profile.first_name : 'hacker'}, welcome to Hack the North 2019! :wave:

I’m Mentorship Bot, here to help you
find a mentor at any time during the
event.`,
  NEED_MENTOR: "Need a mentor? Simply click the button below.",
  NEED_MENTOR_BUTTON: "I need a mentor",
  REQUEST_CONFIRM: "Got it - I have passed on your request to the mentors",
  CANCEL_REQUEST_BUTTON: "Cancel Request",
  MENTOR_REQUEST_TITLE: (user) => `Mentorship request from @${user}`,
  MENTOR_REQUEST_DETAILS: ({ description, location }) => 
    `*Description:*\n${description}\n*Location:*\n${location}`,
  MENTOR_REQUEST_CONFIRM: "Claim",
  MENTOR_REQUEST_DELETE: "Delete",
  MENTOR_MESSAGE_NOTIF: "A mentor sent you a message: ",
  MENTEE_MESSAGE_NOTIF: "The mentee sent you a message: ",
};