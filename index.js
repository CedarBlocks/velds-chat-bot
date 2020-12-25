const socketClient = require("socket.io-client");
const axios = require("axios");
const ms = require('ms');

const connection = socketClient("https://chat-gateway.veld.dev/");
console.log(`starting`);

const members = {};
const channels = {};
let currentUser = null;
let token = null;
let uptime = 0;

connection.on('connect', () => {
  console.log("connected to gateway");
  connection.emit("login", {
    token: null,
    bot: true
  })
  setInterval(() => {
  uptime++
  }, 1);
});

connection.on('connect_error', (error) => {
  console.log(error);
});

connection.on('ready', (info) => {
  console.log(info);
  token = info.token;
  currentUser = info.user;
  for (let m of info.members) {
    members[m.id] = m;
  };
  for (let c of info.channels) {
    channels[c.id] = c;
  }

  connection.emit("channel:message", {
    message: "/nick BOT-miki"
  });
});

connection.on("channel:join", (user) => {
  if (!currentUser) {
    return;
  }

  if (user.id == currentUser.id) {
    return;
  }

  connection.emit('usr-msg', {
    content: "welcome " + user.name + "!"
  });
  members[user.id] = user;
})

connection.on("channel:leave", (user) => {
  connection.emit('usr-msg', {
    content: "bye " + user.name + " :sob:"
  });
  delete members[user.id];
})

let prefix = "."
let startTime = 0
let latency = 0

setInterval(() => {
  startTime = Date.now()
  axios.get('https://chat.veld.dev').then(res => {
    latency = Date.now() - startTime;
  })
}, 5000);

connection.on('message:create', async (message) => {
  console.log(message);
  if (!message.content.startsWith(prefix) || !message.content || members[message.user].bot) {
    return;
  }
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    msgSend(`Pong!\n${latency}ms`);
  } else if (command === 'avatar' || command === 'av') {
    let member = message.mentions[0] ? members[message.mentions[0]] : members[message.user];
    msgSend(`Here is ${member.name}'s avatar\n${member.avatarUrl}`);
  } else if (command === 'say') {
    msgSend(args.join(" "));
  } else if (command === 'eval') {
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
        msgSend(clean(evaled));
      }
    } catch (err) {
      msgSend(`\`ERROR\` \`\n${clean(err)}\n\``);
    };
  } else if (command === 'userinfo' || command === 'ui') {
    let user = message.mentions[0] ? members[message.mentions[0]] : members[message.user];
    try {
      await axios.post(`https://chat-gateway.veld.dev/api/v1/channels/${message.channelId}/messages`, {
        embed: {
          title: `Heres some info about ${user.name}`,
          description: `**ID:** ${user.id}\n**Status:** ${user.status.value}`,
          thumbnailUrl: user.avatarUrl,
          footer: `Bot: ${user.bot ? user.bot + " ✅" : user.bot + " ❌"}`,
          author: {
            iconUrl: members[message.user].avatarUrl,
            value: members[message.user].name
          },
        },
      }, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
    } catch (err) {
      console.log(err.response.data.details);
      return;
    }

  }

  function msgSend(msg) {
    (async () => {
      await axios.post(`https://chat-gateway.veld.dev/api/v1/channels/${message.channelId}/messages`, {
        content: msg,
      }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
    })();
  };

  function msgReply(msg) {
    msgSend(`@${members[message.user].name} ${msg}`)
  };

  function clean(text) {
    if (typeof (text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
      return text;
  }
});