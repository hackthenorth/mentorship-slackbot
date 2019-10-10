import { WebClient } from "@slack/web-api";
import { createEventAdapter } from "@slack/events-api";
import { createMessageAdapter } from "@slack/interactive-messages";

import config from "config";

export const eventsClient = createEventAdapter(config.SIGNING_SECRET);
export const interactionsClient = createMessageAdapter(config.SIGNING_SECRET);
export const webClient = new WebClient(config.BOT_ACCESS_TOKEN);
