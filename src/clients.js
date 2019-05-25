const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

const { SIGNING_SECRET, BOT_ACCESS_TOKEN } = require('../config');

const events = createEventAdapter(SIGNING_SECRET);
const web = new WebClient(BOT_ACCESS_TOKEN);

module.exports = { events, web };