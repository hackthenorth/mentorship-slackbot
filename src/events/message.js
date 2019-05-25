const messageHandler = (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
};

module.exports = messageHandler;