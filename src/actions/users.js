const { web } = require("../clients");

const { welcome } = require("./message");

const { getSession, updateSession } = require("../db");

// tries to add a member to our index
const tryAdd = member => {
  if (member.name !== "pei") return;
  if (getSession(member.id) == null) {
    web.im.open({ user: member.id }).then(({ channel }) => {
      welcome(
        updateSession(member.id, {
          id: member.id,
          channel: channel.id,
          name: member.name
        })
      );
    });
  }
};

const rescan = () => {
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
  getAll().then(members => members.forEach(tryAdd));
};

module.exports = { rescan, tryAdd };
