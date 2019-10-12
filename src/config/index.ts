export default {
  // Channel ID of your private "mentors" slack group
  MENTOR_CHANNEL: "GMXXXXXX",
  // Channel ID of where to post stats updates
  STATS_CHANNEL: "CMXXXXXX",

  // Username of your bot
  BOT_USERNAME: "mentorship_bot",
  // Access token for your bot (should start with xoxb)
  BOT_ACCESS_TOKEN: "xoxb-abcdefghijk-123456789-a1b2c3d4e5",

  // Mentor lead slack username
  MENTOR_LEAD: `<@UABC123>`,

  // Signing secret of your app
  SIGNING_SECRET: "abcdefhijklmnopqrstuvwxyz",
  // Client ID of your Slack App
  SLACK_CLIENT_ID: "1234567890.1234567890",
  // Client Secret of your Slack App
  SLACK_CLIENT_SECRET: "abcdefghijklmnopqrstuvwxyz",

  // Event start time (when the bot should welcome people and start posting stats)
  EVENT_START: "2019-09-13T21:00:00-0400",
  // Event end time (when the bot should stop)
  EVENT_END: "2019-09-15T12:00:00-0400",

  // List of available skills
  SKILLS: {
    backend: "Backend",
    frontend: "Frontend",
    android: "Android",
    ios: "iOS",
    "react-native": "React Native",
    vr: "Virtual Reality",
    design: "Design",
    hardware: "Hardware"
    // add more... (or take some away)
  }
};
