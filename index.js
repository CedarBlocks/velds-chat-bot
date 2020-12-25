const socketClient = require("socket.io-client");
const axios = require("axios");
const ms = require("ms");

const connection = socketClient("https://chat-gateway.veld.dev/");
console.log(`starting`);

const members = {};
const channels = {};
let commands = [];
let currentUser = null;
let token = null;
let uptime = 0;
connection.on("connect", () => {
  console.log("connected to gateway");
  connection.emit("login", {
    token: null,
    bot: true
  });
  setInterval(() => {
    uptime++;
  }, 1);
});
connection.on("connect_error", error => {
  console.log(error);
});

connection.on("ready", info => {
  token = info.token;
  currentUser = info.user;
  for (let m of info.members) {
    members[m.id] = m;
  }
  for (let c of info.channels) {
    channels[c.id] = c;
  }

  connection.emit("channel:message", {
    message: "/nick Bread-bot"
  });
});

connection.on("channel:join", user => {
  if (!currentUser) {
    return;
  }

  if (user.id == currentUser.id) {
    return;
  }

  connection.emit("usr-msg", {
    content: "welcome " + user.name + "!"
  });
  members[user.id] = user;
});

connection.on("channel:leave", user => {
  connection.emit("usr-msg", {
    content: "bye " + user.name + " :sob:"
  });
  delete members[user.id];
});

let prefix = "pog ";
let startTime = 0;
let latency = 0;

setInterval(() => {
  startTime = Date.now();
  axios.get("https://chat.veld.dev").then(res => {
    latency = Date.now() - startTime;
  });
}, 5000);
const fs = require("fs");
fs.readdir("./commands/", (err, files) => {
  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    console.log("Could not find any commands");
    return;
  }
  jsfile.forEach(f => {
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    commands[props.help.name] = props;
  });
});

connection.on("message:create", async message => {
  message.ping = latency
  message.cats = ["general", "text"];
  message.commands = commands;
  if (
    !message.content.startsWith(prefix) ||
    !message.content ||
    members[message.user].bot
  ) {
    return;
  }
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/);
  let command = args.shift().toLowerCase();
  let command2 = undefined;
  if (commands[command]) {
    command2 = commands[command];
  }
  if (command2 !== undefined) {
    command2.run(message, token, members, args);
  }
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

  function clean(text) {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
  }
});
