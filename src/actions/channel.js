const { web } = require("../clients");
const { getChannelId, setChannelId } = require("../db");

const getMentorRequestChannelId = () => {
  const channelId = getChannelId();

  if (channelId) {
    return channelId;
  } else {
    console.log("non-existent channel id, fetching...");
    web.conversations
      .list({
        types: "private_channel",
        exclude_archived: true
      })
      .then(({ channels }) => {
        // assume bot is only added to the mentor_request channel
        // console.log(channels[0].id);
        setChannelId(channels[0].id);
      });
  }
};

module.exports = { getMentorRequestChannelId };
