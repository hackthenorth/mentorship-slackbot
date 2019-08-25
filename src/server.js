const http = require("http");
const bodyParser = require("body-parser");
const express = require("express");
const request = require('request');

const port = process.env.PORT || 3000;

const { events, interactions } = require("./clients");

const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require("../config");

const app = express();

app.get('/auth', function(req, res){
  if (!req.query.code) { // access denied
    return;
  }
  var data = {form: {
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code: req.query.code
  }};
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Get an auth token
      let oauthToken = JSON.parse(body).access_token;

      console.log(body);
      // OAuth done- redirect the user to wherever
      res.redirect(__dirname + "/public/success.html");
    }
  })
});

// Plug the event adapter into the express app as middleware
app.use("/slack/events", events.expressMiddleware());

// Plug the interactions adapter into the express app as middleware
require("./events/interactions").bootstrap(interactions);
app.use("/slack/actions", interactions.expressMiddleware());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
events.on("message", event => require("./events/message")(event));
// events.on('app_mention', require('./events/message'));
// events.on('message.im', require('./events/message'));
// events.on('message.group', console.log);

// Handle errors (see `errorCodes` export)
events.on("error", console.error);

// Start a basic HTTP server
http.createServer(app).listen(port, () => {
  // Listening on path '/slack/events' by default
  console.log(`Server listening on port ${port}`);
});

require("./actions/timed").init();