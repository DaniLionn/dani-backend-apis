const https = require("https");
const fs = require("fs");
const path = require("path");
var HTMLParser = require("node-html-parser");

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
  "get/scripts/wiirpc": async function (req, res) {
    const game = req.query.game;
    console.log(game);
    res.status(200).send("Ok!");
  },
};
