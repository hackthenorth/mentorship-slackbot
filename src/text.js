module.exports = {
  WELCOME: (member) => 
`Hi ${member ? member.profile.first_name : 'hacker'}, welcome to Hack the North 2019! :wave:

I’m Mentorship Bot, here to help you
find a mentor at any time during the
event.`,
  NEED_MENTOR: () => `Need a mentor? Simply click the button below.`,
  NEED_MENTOR_BUTTON: () => `I need a mentor`,
  EXPLAIN_PROBLEM: () => `I'm here to help! Please explain your problem to me in 2-3 sentences`,
  LOCATION: () => `Got it! Where can a mentor find you?`
};