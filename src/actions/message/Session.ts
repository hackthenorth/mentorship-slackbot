import { ClaimedSession } from "typings";
import { buildSimpleBlock, buildRequestBlock, send } from "./util";

export function introduce(session: ClaimedSession) {
  const { blocks } = buildRequestBlock(session, "intro");
  const introText = `👋 Hello <@${session.id}>! Your session has been claimed by <@${session.mentor}>, our resident expert of Hacking, Northing, and everything in-between. As a reminder, your request was as follows:`;
  return send({
    channel: session.group_id,
    ...buildSimpleBlock(introText, blocks)
  });
}

export function surrender(session: ClaimedSession) {
  const text = `<@${session.mentor}> has surrendered - your request will be placed back in the pool of active mentor requests`;
  return send({
    channel: session.group_id,
    ...buildSimpleBlock(text)
  });
}

export function complete(session: ClaimedSession) {
  const text = `<@${session.mentor}> has marked this session as completed. Archiving this channel 😎`;
  return send({
    channel: session.group_id,
    ...buildSimpleBlock(text)
  });
}
