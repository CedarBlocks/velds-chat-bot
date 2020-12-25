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
  let startTime = 0;
  let latency = 0;

  setInterval(() => {
    startTime = Date.now();
    axios.get("https://chat.veld.dev").then(res => {
      latency = Date.now() - startTime;
    });
  }, 5000);
  await axios.post(
      `https://chat-gateway.veld.dev/api/v1/channels/${message.channelId}/messages`,
      {
        embed: {
          title: `Help`,
          description: `Help, Ping, Npm, Smalltext`,

         
        }
      },
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

};
module.exports.help = {
  name: "help",
  category: "general"
};
