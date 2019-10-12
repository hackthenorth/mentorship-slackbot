import Config from "config";
import { buildSimpleBlock, send } from "./utils";

export function update(created: number, online: number) {
  const text = `Hello there! Your friendly neighbourhood mentorship bot reporting in 😊

  So far, we have:
  👋 ${created} mentor requests created
  😊 ${online} mentor${online === 1 ? "" : "s"} online
  
  Need a mentor? Send me a message and we'll get you help ASAP. Alternatively, feel free to drop by the mentorship hub in the E7 CND (check the map)!
  `;
  return send({
    channel: Config.STATS_CHANNEL,
    ...buildSimpleBlock(text)
  });
}
