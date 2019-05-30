const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const { events } = require('./clients');

const app = express();

// Plug the event adapter into the express app as middleware
app.use('/slack/events', events.expressMiddleware());

// route for interactive components
app.post('/slack/actions', (req, res) => {
  res.sendStatus(200);
  console.log("got action");
  console.log(req.body);
  // TODO: Add user to requests list
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
events.on('message', (event) => require('./events/message')(event));
// events.on('app_mention', require('./events/message'));
// events.on('message.im', require('./events/message'));
events.on('team_join', require('./events/teamJoin'));

// Handle errors (see `errorCodes` export)
events.on('error', console.error);

// Start a basic HTTP server
http.createServer(app).listen(port, () => {
  // Listening on path '/slack/events' by default
  console.log(`Server listening on port ${port}`);
});

require('./actions/users').rescan();