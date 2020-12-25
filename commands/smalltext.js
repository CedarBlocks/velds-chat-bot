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
  function smalltext(text) {
    let tiny = {
      a: "ᵃ",
      b: "ᵇ",
      c: "ᶜ",
      d: "ᵈ",
      e: "ᵉ",
      f: "ᶠ",
      g: "ᵍ",
      h: "ʰ",
      i: "ᶦ",
      j: "ʲ",
      k: "ᵏ",
      l: "ᶫ",
      m: "ᵐ",
      n: "ᶰ",
      o: "ᵒ",
      p: "ᵖ",
      q: "ᑫ",
      r: "ʳ",
      s: "ˢ",
      t: "ᵗ",
      u: "ᵘ",
      v: "ᵛ",
      w: "ʷ",
      x: "ˣ",
      y: "ʸ",
      z: "ᶻ",
      A: "ᴬ",
      B: "ᴮ",
      C: "ᶜ",
      D: "ᴰ",
      E: "ᴱ",
      F: "ᶠ",
      G: "ᴳ",
      H: "ᴴ",
      I: "ᴵ",
      J: "ᴶ",
      K: "ᴷ",
      L: "ᴸ",
      M: "ᴹ",
      N: "ᴺ",
      O: "ᴼ",
      P: "ᴾ",
      Q: "ᑫ",
      R: "ᴿ",
      S: "ˢ",
      T: "ᵀ",
      U: "ᵁ",
      V: "ⱽ",
      W: "ᵂ",
      X: "ˣ",
      Y: "ʸ",
      Z: "ᶻ",
      "`": "`",
      "~": "~",
      "!": "﹗",
      "@": "@",
      "#": "#",
      $: "﹩",
      "%": "﹪",
      "^": "^",
      "&": "﹠",
      "*": "﹡",
      "(": "⁽",
      ")": "⁾",
      _: "⁻",
      "-": "⁻",
      "=": "⁼",
      "+": "+",
      "{": "{",
      "[": "[",
      "}": "}",
      "]": "]",
      ":": "﹕",
      ";": "﹔",
      "?": "﹖"
    };
    return text
      .split("")
      .map(function(a) {
        return tiny.hasOwnProperty(a) ? tiny[a] : a;
      })
      .join("");
  }
  function msgReply(msg) {
    msgSend(`@${members[message.user].name} ${msg}`);
  }
  let text = args.join(" ");
  if (!text) msgReply("Please include text");
  msgSend(smalltext(text));
};
module.exports.help = {
  name: "smalltext",
  category: "text"
};
