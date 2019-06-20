const { tryAdd } = require("../actions/users");

const onTeamJoin = event => {
  tryAdd(event.user);
};

module.exports = onTeamJoin;
