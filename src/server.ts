import * as http from "http";
import bodyParser from "body-parser";
import express from "express";
import request from "request";

import config from "config";
import { eventsClient, interactionsClient } from "clients";

import { report } from "utils";

import * as interactions from "events/interactions";
import * as message from "events/message";

import * as timed from "actions/timed";

const port = process.env.PORT || 3000;

const app = express();

app.get("/auth", function(req, res) {
  if (!req.query.code) {
    // access denied
    return;
  }
  const data = {
    form: {
      client_id: config.SLACK_CLIENT_ID,
      client_secret: config.SLACK_CLIENT_SECRET,
      code: req.query.code
    }
  };
  request.post("https://slack.com/api/oauth.access", data, function(
    error,
    response,
    body
  ) {
    if (!error && response.statusCode == 200) {
      // Get an auth token
      res.json({
        success: true,
        result: JSON.parse(body)
      });
    } else {
      res.json({
        success: false,
        error
      });
    }
  });
});

// Plug the event adapter into the express app as middleware
app.use("/slack/events", eventsClient.expressMiddleware());

// Plug the interactions adapter into the express app as middleware
interactions.bootstrap(interactionsClient);
app.use("/slack/actions", interactionsClient.expressMiddleware());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

eventsClient.on("message", event => message.handle(event));
eventsClient.on("error", report);

// Start a basic HTTP server
http.createServer(app).listen(port, () => {
  // Listening on path '/slack/events' by default
  console.log(`Server listening on port ${port}`);
});

timed.init();
