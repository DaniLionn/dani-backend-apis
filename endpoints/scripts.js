const https = require("https");
const fs = require("fs");
const path = require("path");
var HTMLParser = require("node-html-parser");
const { Webhook } = require("discord-webhook-node");
const websiteHook = new Webhook(process.env.WII_WEBHOOK_URL);

async function download(url, name) {
  const file = fs.createWriteStream(name);
  return new Promise((resolve, reject) => {
    https
      .get(url, function (response) {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(file);
        });

        file.on("error", (err) => {
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = {
  "get/scripts/download-discord/linux": async function (req, res) {
    const file = await download(
      "https://discord.com/api/download?platform=linux&format=tar.gz",
      "discorddownload.htm"
    );
    var link;

    link = HTMLParser.parse(
      fs.readFileSync(path.join("./", file.path))
    ).querySelector("a").attributes.href;
    await res.send(link);
    await fs.promises.unlink(file.path);
  },
  "get/scripts/wiirpc-register": async function (req, res) {
    const game = req.query.game_id;
    console.log(game);
    if (!game) return res.status(400).send("No game id provided");
    fs.writeFileSync(
      path.join(__dirname, "wiirpc/game_id.txt"),
      game.toString()
    );
    res.status(200).send("Ok!");
  },
  "get/scripts/wiirpc-read": async function (req, res) {
    const game = req.query.game_id;
    console.log(game);
    if (!game) return res.status(400).send("No game id provided");
    fs.writeFileSync(
      path.join(__dirname, "wiirpc/game_id.txt"),
      game.toString()
    );
    websiteHook.send(game.toString());
    res.status(200).send("Ok!");
  },
};
