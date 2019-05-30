const { web } = require('../clients');

const { welcome } = require('./message');

// tries to add a member to our index
const tryAdd = (member) => {
  if (member.name !== 'pei' || member.name !== 'jason') return;
  welcome(member);
}

const rescan = () => {
  const getAll = (cursor = undefined) => {
    return web.users.list({ cursor }).then(({ members, response_metadata: { next_cursor } }) => {
      if (next_cursor === '') {
        return members;
      } else {
        return getAll(next_cursor).then((nextMembers) => {
          return [...members, ...nextMembers];
        });
      }
    });
  }
  getAll().then((members) => members.forEach(tryAdd));
}

module.exports = { rescan };