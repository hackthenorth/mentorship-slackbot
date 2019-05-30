const bootstrap = (interactions) => {
  interactions.action({ actionId: 'need_mentor'}, console.log);
};

module.exports = { bootstrap };