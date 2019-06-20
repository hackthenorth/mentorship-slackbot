const { WebClient } = require("@slack/web-api");
const { createEventAdapter } = require("@slack/events-api");
const { createMessageAdapter } = require("@slack/interactive-messages");

const { SIGNING_SECRET, BOT_ACCESS_TOKEN } = require("../config");

const events = createEventAdapter(SIGNING_SECRET);
const interactions = createMessageAdapter(SIGNING_SECRET);
const web = new WebClient(BOT_ACCESS_TOKEN);

module.exports = { events, web, interactions };
