const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ channel_id: "", threads: [] })
  .write()

const getChannelId = () => db.get('channel_id').value();

const setChannelId = (id) => db.set('channel_id', id).write();

const setChannelWithTimestamp = (channel, ts) => {
  // one thread per user, need a better way to insert unique objects
  if (!getTimestampByChannel(channel)) {
    console.log("pushing new thread");
    db.get('threads').push({ channel, ts }).write();
  }
};

const getTimestampByChannel = (channel) => db.get('threads').find({ channel }).value();

const getChannelByTimestamp = (ts) => db.get('threads').find({ ts }).value();

module.exports = { getChannelId, setChannelId, setChannelWithTimestamp, getChannelByTimestamp, getTimestampByChannel };
