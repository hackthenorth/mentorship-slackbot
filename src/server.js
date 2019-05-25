const { events } = require('./clients');

const port = process.env.PORT || 3000;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
events.on('message', require('./events/message'));
events.on('team_join', require('./events/teamJoin'));

// Handle errors (see `errorCodes` export)
events.on('error', console.error);

// Start a basic HTTP server
events.start(port).then(() => {
  // Listening on path '/slack/events' by default
  console.log(`Server listening on port ${port}`);
});

require('./actions/users').rescan();