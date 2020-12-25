module.exports.run = async (message, token, members, args) => {
  let axios = require("axios");
  function msgSend(msg) {
    (async () => {
      await axios.post(
        `https://chat-gateway.veld.dev/api/v1/channels/${message.channelId}/messages`,
        {
          content: msg
        },
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );
    })();
  }
 
  msgSend(`Pong!\n${message.ping}ms`);
};
module.exports.help = {
  name: "ping",
  category: "general"
};
