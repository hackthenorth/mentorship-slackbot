const { SKILLS } = require("../config");

const db = require("./db");

module.exports = {
  WELCOME: name =>
    `Hi ${name ? name : "hacker"}, welcome to Hack the North 2019! :wave:

I’m Mentorship Bot, here to help you
find a mentor at any time during the
event.`,
  BUMP: (permalink, session) => `<@${session.id}>'s <${permalink}|mentorship request${session.submission.skill != null ? ` regarding ${session.submission.skill}` : ''}> has not received any attention recently. Please take a look!`,
  BUMP_SURRENDER: (permalink, session) => `<@${session.id}>'s <${permalink}|mentorship request${session.submission.skill != null ? ` regarding ${session.submission.skill}` : ''}> *was surrendered*. Someone please take a look!`,
  NEED_MENTOR: "Need a mentor? Simply click the button below.",
  NEED_MENTOR_BUTTON: "I need a mentor",
  NO_SESSION: "You do not currently have a mentorship session active.",
  NO_UNDERSTAND: "Sorry, I am not equipped to deal with messages.",
  NO_UNDERSTAND_MENTOR: "Sorry, I don't understand your message. Try `!skills help` to see and set your skills",
  REQUEST_CONFIRM: "*Your request has been sent to mentors*",
  CANCEL_REQUEST_BUTTON: "Cancel Request",
  MENTOR_REQUEST_CLAIMED: claimer => `Request claimed by <@${claimer}>`,
  MENTOR_REQUEST_CANCELED: "*Request canceled by user*",
  MENTOR_REQUEST_DELETED: "*Request has been deleted*",
  MENTOR_REQUEST_TITLE: (user, { location, skill }, mentors) =>
    `Mentorship request from @${user}\nLocation: ${location}${skill != null ? `\nCategory: ${SKILLS[skill]} ${mentors.length > 0 ? `(${mentors.map(m => `<@${m}>`).join(', ')})` : ''}` : ''}`,
  MENTOR_REQUEST_DETAILS: ({ description }) => description,
  MENTOR_REQUEST_FOOTER:
    "You may use this message's thread to communicate with the user and request further clarification",
  MENTOR_REQUEST_CONFIRM: "Claim",
  MENTOR_REQUEST_DELETE: "Delete",
  MENTOR_REQUEST_SURRENDER: "Surrender",
  MENTOR_REQUEST_COMPLETE: 'Mark Complete',
  MENTEE_MESSAGE_NOTIF: username =>
    `Your request has been submitted @${username}!`,
  MENTEE_MESSAGE_NOTIF_CONTEXT: `Until you are matched, you may send a message to this thread to communicate with mentors. Similarly, I will forward any questions the mentors may have into this thread as well :)`,
  SESSION_ALREADY_ACTIVE: "You already have an active mentorship session",
  SESSION_CLAIMED: ({id}) =>
    `Thank you for claiming <@${id}>'s request ️❤️. Please use this message to private message to manage this session.`,
  SESSION_DELETED:
    "Your mentorship request was deleted by a mentor - if you believe this was a mistake, please make a new request or contact our mentorship lead @bonnie",
  SESSION_DELETED_MENTOR: "This mentorship request has been deleted",
  SESSION_INTRODUCTION: (session) => `👋 Hello <@${session.id}>! Your session has been claimed by <@${session.mentor}>, our resident expert of Hacking, Northing, and everything in-between. As a reminder, your request was as follows:`,
  SESSION_SURRENDERED_MENTOR: `You have surrendered the session`,
  SESSION_SURRENDERED: (session) => `<@${session.mentor}> has surrendered - your request will be placed back in the pool of active mentor requests`,
  SESSION_COMPLETED_MENTOR: `Your session has has been marked complete`,
  SESSION_COMPLETED_MENTEE: `*Your request has been marked complete*`,
  SESSION_COMPLETED: (session) => `<@${session.mentor}> has marked this session as completed. Archiving this channel 😎`,
  SKILLS_HELP: (skills) => 
    `Set your skills so we can notify you when a relevant request comes in! 

You can set your skills with the command 
\`\`\`
!skills [skill1] [skill2] ...
\`\`\`

*The available skills are:*

${skills.join("\n")}`,
  SKILLS_SET: (skills) => `You have successfully set your skills to 
\`\`\`
${skills.length > 0 ? `[\n  ${skills.join(",\n  ")}\n]` : `[None]`}
\`\`\` 
`
};
