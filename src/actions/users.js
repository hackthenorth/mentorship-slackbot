const { CHANNEL_ID } = require("../../config");

const { web } = require("../clients");

const { welcome } = require("./message");

const db = require("../db");

const { runnable } = require("./timed");

// tries to add a member to our index
const tryAdd = member => {
  if (!runnable()) return;
  if (!member.is_bot && db.getSession(member.id) == null) {
    web.im.open({ user: member.id }).then(({ channel }) => {
      welcome(
        db.updateSession(member.id, {
          id: member.id,
          channel: channel.id,
          name: member.name
        })
      );
    });
  }
};

const updateMentors = (members, mentorChannelIds) => {
  const existingMentors = db.getMentors();
  const mentors = {};
  for (const member of members) {
    if (mentorChannelIds.has(member.id)) {
      mentors[member.id] = existingMentors[member.id] || {
        skills: {}
      };
    }
  }
  Promise.all(Object.keys(mentors).map(user => web.users.getPresence({ user })))
    .then(
      results => results.filter(({ presence }) => presence === "active").length
    )
    .then(db.setOnline);
  db.setMentors(mentors);
};

const rescan = () => {
  const getMembers = (channel, cursor = undefined) => {
    return web.conversations
      .members({ channel, cursor })
      .then(({ members, response_metadata: { next_cursor } }) => {
        if (next_cursor === "") {
          return members;
        } else {
          return getMentors(channel, next_cursor).then(nextMembers => {
            return [...members, ...nextMembers];
          });
        }
      });
  };
  const getAll = (cursor = undefined) => {
    return web.users
      .list({ cursor })
      .then(({ members, response_metadata: { next_cursor } }) => {
        if (next_cursor === "") {
          return members;
        } else {
          return getAll(next_cursor).then(nextMembers => {
            return [...members, ...nextMembers];
          });
        }
      });
  };
  Promise.all([getAll(), getMembers(CHANNEL_ID)]).then(
    ([members, mentorChannelIds]) => {
      members.forEach(tryAdd);
      updateMentors(members, new Set(mentorChannelIds));
    }
  );
};

module.exports = { rescan, tryAdd };
