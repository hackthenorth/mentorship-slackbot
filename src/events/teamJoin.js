const { rescan } = require('../actions/users');
const { welcome } = require('../actions/message');

const onTeamJoin = (event) => {
  welcome(event.user);
};

module.exports = onTeamJoin;