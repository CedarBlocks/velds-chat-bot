module.exports.run = async (message, token, members, args) => {
  let moment = require("moment");
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

  function msgReply(msg) {
    msgSend(`@${members[message.user].name} ${msg}`);
  }
  try {
    const request = require("node-superfetch");
    let npm = args[0];
    let ws = "↦";
    if (!npm) return msgReply("Please include an npm");
    const { body } = await request.get(`https://registry.npmjs.com/${npm}`);
    if (!body) return msgReply("Package doesnt exist");
    if (body.time.unpublished)
      return msgReply("This package no longer exists.");
    const version = body.versions[body["dist-tags"].latest];
    function trimArray(arr, maxLen = 10) {
      if (arr.length > maxLen) {
        const len = arr.length - maxLen;
        arr = arr.slice(0, maxLen);
        arr.push(`${len} more...`);
      }
      return arr;
    }
    const maintainers = trimArray(body.maintainers.map(user => user.name));

    await axios.post(
      `https://chat-gateway.veld.dev/api/v1/channels/${message.channelId}/messages`,
      {
        embed: {
          title: `NPM`,
          description: `**Name** ${ws} [${
            body.name
          }](https://www.npmjs.com/package/${npm})\n **Version** ${ws} ${
            body["dist-tags"].latest
          }\n **Description** ${ws} ${body.description ||
            "No description."}\n **Main file** ${ws} ${version.main ||
            "index.js"}\n **Keywords** ${ws} ${
            body.keywords.length > 5
              ? `${body.keywords.slice(0, 5).join(", ")} and ${body.keywords
                  .length - 5} more...`
              : body.keywords.join(" ")
          }\n **Author** ${ws} ${
            body.author ? body.author.name : "???"
          }\n **Created at** ${ws} ${moment
            .utc(body.time.created)
            .format("MM/DD/YYYY h:mm A")}\n **Last update** ${ws} ${moment
            .utc(body.time.modified)
            .format(
              "MM/DD/YYYY h:mm A"
            )}\n **Maintainers** ${ws} ${maintainers.join(", ")}`,

          author: {
            iconUrl: "https://i.imgur.com/ErKf5Y0.png",
            value: "NPM"
          }
        }
      },
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );
  } catch (err) {
    message.channel.send("Package not found");
  }
};
module.exports.help = {
  name: "npm",
  category: "geenral"
};
