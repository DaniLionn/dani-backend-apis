const fs = require("node:fs");
const path = require("node:path");
const { Collection } = require("discord.js");
const { Downloader } = require("nodejs-file-downloader");

exports.download = async function (url, dir, name) {
  if (!dir) {
    dir = path.join(process.env.LEE_ROOT_DIR, "temp");
  }

  var downloader;

  if (name) {
    downloader = new Downloader({
      url: url,
      directory: dir,
      fileName: name,
    });
  } else {
    downloader = new Downloader({
      url: url,
      directory: dir,
    });
  }

  try {
    const { filePath } = await downloader.download();

    return filePath;
  } catch (error) {
    console.log("Download failed", error);
  }
};

exports.downloadAlt = async function (url, dir) {
  const downloader = new Downloader({
    url: url,
    directory: dir,
  });
  return (await downloader.download()).filePath;
};

exports.randomSelect = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};

exports.random = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.randomUser = async function (client, serverId) {
  const server =
    (serverId != undefined && client.guilds.cache.get(serverId)) ||
    client.guilds.cache.random();
  const members = await server.members.fetch();
  const member = members.random();
  const user = member.user;
  return user;
};
exports.loadCommands = async function (client) {
  client.commands = new Collection();

  const foldersPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }
};

exports.deployCommands = function () {
  require("./deploy-commands");
};

exports.readUserData = function () {
  const data = fs.readFileSync("/var/data/userdata.json", "utf8");
  return JSON.parse(data);
};
exports.writeUserData = function (data, id) {
  var read = fs.readFileSync("/var/data/userdata.json", "utf8");

  read[id] = data;
  fs.writeFileSync("/var/data/userdata.json", JSON.stringify(read));
};
