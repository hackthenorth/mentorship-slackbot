const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ channel_id: "" })
  .write()

const getChannelId = () => db.get('channel_id').value();

const setChannelId = (id) => db.set('channel_id', id).write();

module.exports = { getChannelId, setChannelId };
