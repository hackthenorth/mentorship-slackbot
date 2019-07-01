module.exports = {
  WELCOME: name =>
    `Hi ${name ? name : "hacker"}, welcome to Hack the North 2019! :wave:

I’m Mentorship Bot, here to help you
find a mentor at any time during the
event.`,
  NEED_MENTOR: "Need a mentor? Simply click the button below.",
  NEED_MENTOR_BUTTON: "I need a mentor",
  NO_SESSION: "You do not currently have a mentorship session active.",
  NO_UNDERSTAND: "Sorry, I am not equipped to deal with messages.",  
  REQUEST_CONFIRM: "Got it - I have passed on your request to the mentors",
  CANCEL_REQUEST_BUTTON: "Cancel Request",
  MENTOR_REQUEST_TITLE: (user, { location }) =>
    `Mentorship request from @${user}\nLocation: ${location}`,
  MENTOR_REQUEST_DETAILS: ({ description }) => description,
  MENTOR_REQUEST_FOOTER: "You may use this message's thread to communicate with the user and request further clarification",
  MENTOR_REQUEST_CONFIRM: "Claim",
  MENTOR_REQUEST_DELETE: "Delete",
  MENTEE_MESSAGE_NOTIF: (username) => `Your request has been submitted @${username}!`,
  MENTEE_MESSAGE_NOTIF_CONTEXT: `Until you are matched, you may send a message to this thread to communicate with mentors. Similarly, I will forward any questions the mentors may have into this thread as well :)`,
  SESSION_ALREADY_ACTIVE: "You already have an active mentorship session",
  SESSION_DELETED: "Your mentorship session was deleted by a mentor - if you believe this was a mistake, please make a new request or contact our mentorship lead @bonnie",
};
