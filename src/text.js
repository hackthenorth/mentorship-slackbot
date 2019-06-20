module.exports = {
  WELCOME: name =>
    `Hi ${name ? name : "hacker"}, welcome to Hack the North 2019! :wave:

I’m Mentorship Bot, here to help you
find a mentor at any time during the
event.`,
  NEED_MENTOR: "Need a mentor? Simply click the button below.",
  NEED_MENTOR_BUTTON: "I need a mentor",
  NO_SESSION: "You do not currently have a mentorship session active.",
  REQUEST_CONFIRM: "Got it - I have passed on your request to the mentors",
  CANCEL_REQUEST_BUTTON: "Cancel Request",
  MENTOR_REQUEST_TITLE: (user, { location }) =>
    `Mentorship request from @${user}\nLocation: ${location}`,
  MENTOR_REQUEST_DETAILS: ({ description }) => description,
  MENTOR_REQUEST_CONFIRM: "Claim",
  MENTOR_REQUEST_DELETE: "Delete",
  MENTOR_MESSAGE_NOTIF: "A mentor sent you a message, reply by typing here",
  MENTEE_MESSAGE_NOTIF: "The mentee sent you a message",
  SESSION_ALREADY_ACTIVE: "You already have an active mentorship session",
  SESSION_DELETED: "Your mentorship session was deleted by a mentor - if you believe this was a mistake, please make a new request or contact our mentorship lead @bonnie",
};
