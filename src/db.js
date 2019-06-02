const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ channel_id: "", threads: [] })
  .write()

const getChannelId = () => db.get('channel_id').value();

const setChannelId = (id) => db.set('channel_id', id).write();

const getThreads = () => db.get('threads').value();

const addThread = (ts) => db.get('threads').push(ts).write();

module.exports = { getChannelId, setChannelId, getThreads, addThread };
