const { web } = require('../clients');

const { BOT_USERNAME } = require('../../config');

const Text = require('../text');

const welcome = (member) => {
  web.chat.postMessage({ channel: member.id, text: Text.WELCOME(member), as_user: false, username: BOT_USERNAME }).catch(console.error);
}

module.exports = { welcome };