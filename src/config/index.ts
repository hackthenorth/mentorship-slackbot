const { MENTOR_LEAD, BOT_ACCESS_TOKEN, SIGNING_SECRET, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, MENTOR_CHANNEL, STATS_CHANNEL } = process.env;

export default {
  // Name of your event
  EVENT_NAME: "VandyHacks VI",
  // Location of mentor hub
  MENTOR_HUB: "E7 CND",

  // Channel ID of your private "mentors" slack group
  MENTOR_CHANNEL: MENTOR_CHANNEL as string,
  // Channel ID of where to post stats updates
  STATS_CHANNEL: STATS_CHANNEL as string,

  // Username of your bot
  BOT_USERNAME: "mentorship_bot",
  // Access token for your bot (should start with xoxb)
  BOT_ACCESS_TOKEN: BOT_ACCESS_TOKEN as string,

  // Mentor lead slack username
  MENTOR_LEAD: MENTOR_LEAD as string,

  // Signing secret of your app
  SIGNING_SECRET: SIGNING_SECRET as string,
  // Client ID of your Slack App
  SLACK_CLIENT_ID: SLACK_CLIENT_ID as string,
  // Client Secret of your Slack App
  SLACK_CLIENT_SECRET: SLACK_CLIENT_ID as string,

  // Event start time (when the bot should welcome people and start posting stats)
  // ISO 8601
  EVENT_START: "2019-010-23T21:00:00-0400",
  // Event end time (when the bot should stop)
  // ISO 8601
  EVENT_END: "2019-11-05T12:00:00-0400",

  // List of available skills
  SKILLS: {
    backend: "Backend",
    frontend: "Frontend",
    android: "Android",
    ios: "iOS",
    vr: "Virtual Reality",
    design: "Design",
    hardware: "Hardware"
    // add more... (or take some away)
  }
};
