const { rescan } = require('../actions/users');

const onTeamJoin = (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
};

module.exports = onTeamJoin;