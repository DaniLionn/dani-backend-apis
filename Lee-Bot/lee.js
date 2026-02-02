const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  AttachmentBuilder,
  ActivityType,
} = require("discord.js");
const {
  download,
  randomSelect,
  randomUser,
  readUserData,
  writeUserData,
} = require("./scripts/utils");

const token = process.env.LEE_TOKEN;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});
const currentYear = new Date().getFullYear();

var randomStatuses = [
  [ActivityType.Playing, "Lee Wars 2007"],
  [ActivityType.Competing, "hottest bot championships " + currentYear],
  [ActivityType.Custom, "🪵"],
  [ActivityType.Custom, "i am lee bot"],
  [
    ActivityType.Custom,
    "i fall asleep to the sound of a dial up modem dialing",
  ],
  [
    ActivityType.Competing,
    `the biggest fart competition ${currentYear} (and winning 😄)`,
  ],
  [
    ActivityType.Competing,
    `the biggest fart competition ${currentYear} (and losing to PLACEHOLDER)`,
  ],
  [ActivityType.Listening, "the voices"],
  [
    ActivityType.Custom,
    "is it just me or is it hot in here? *fade to picture of carrot*",
  ],
  [ActivityType.Custom, "Lee ✌️😂"],
  [ActivityType.Custom, "Eating a. Joo loo"],
];

const leedir = process.env.LEE_ROOT_DIR;

module.exports = {
  startLee: function () {
    async function main() {
      console.log("[lee.js:64] Starting lee bot!");

      client.once(Events.ClientReady, async (readyClient) => {
        async function setStatus() {
          const randomStatus = randomSelect(randomStatuses);

          if (randomStatus === randomStatuses[6]) {
            const randomGuy = await randomUser(client);
            randomStatus[1] = randomStatuses[6][1].replace(
              "PLACEHOLDER",
              randomGuy.displayName || randomGuy.username,
            );
          }
          client.user.setPresence({
            activities: [{ name: randomStatus[1], type: randomStatus[0] }],
          });
        }

        console.log(`[lee.js:74] Ready! Logged in as ${readyClient.user.tag}`);
        require("./scripts/deploy-commands");
        await setStatus();
        setInterval(setStatus, 5 * 60_000);
      });

      client.commands = new Collection();

      const foldersPath = path.join(__dirname, "commands");
      const commandFolders = fs.readdirSync(foldersPath);

      var lastChannel;

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
              `[lee.js:100] [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
            );
          }
        }
      }

      client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(
          interaction.commandName,
        );

        lastChannel = interaction.channel;

        if (!command) {
          console.error(
            `No command matching ${interaction.commandName} was found.`,
          );
          return;
        }
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(
            "Command execution error:",
            error?.stack || error?.message || String(error),
          );

          try {
            await fs.promises.writeFile(
              path.join(leedir, "temp/errorDetails.txt"),
              "Error Details:\n" +
                (error?.stack || error?.message || String(error)),
            );
          } catch (fsWriteError) {
            console.error("Failed to write error details file:", fsWriteError);
          }

          try {
            const response = {
              content:
                "There was an error while executing this command!\n(Don't worry if you don't understand this, this is just here for debugging purposes.)",
              files: [path.join(leedir, "temp/errorDetails.txt")],
            };

            if (interaction.replied || interaction.deferred) {
              await interaction.followUp(response);
            } else {
              await interaction.reply(response);
            }
          } catch (interactionError) {
            console.error("Failed to reply to interaction:", interactionError);
          }

          try {
            await fs.promises.unlink(
              path.join(leedir, "temp/errorDetails.txt"),
            );
          } catch (fsDeleteError) {
            console.error(
              "Failed to delete error details file:",
              fsDeleteError,
            );
          }
        }
      });

      client.on(Events.MessageCreate, async (message) => {
        if (message.channel.id === "1427756885154598973") {
          if (message.author.bot && message.author.id !== client.user.id) {
            await message.delete();
            return;
          }
        }
        if (message.author.bot) {
          return;
        }

        if (message.channel.id === "1417504755319701644") {
          //ignore links
          if (
            message.content.startsWith("http://") ||
            message.content.startsWith("https://")
          ) {
            return;
          }

          if (message.content.toLowerCase() === ".fm") {
            return;
          }
          if (message.content.toLowerCase().includes("f")) {
            await message.delete();
            let isAllCaps = message.content === message.content.toUpperCase();
            let phixedMessage = message.content.replace(/f/gi, (match) => {
              if (isAllCaps) return "PH";
              if (match === "F") return "Ph";
              return "ph";
            });

            await message.channel.send({
              content: `<@${message.author.id}> You broke the "replace f with ph" rule! Did you mean to say "${phixedMessage}"?`,
            });
            return;
          }
        }
        if (
          /*message.member.roles.cache.has(process.env.modID) &&*/
          message.content.startsWith("lee:")
        ) {
          await message.delete();

          await message.channel.sendTyping();
          const attachmentsGrab = message.attachments;
          var attachmentsSend = [];

          attachmentsGrab.forEach(async (attachment) => {
            console.log(attachment);
            await download(attachment.url).then(async (path) => {
              attachmentsSend[attachmentsSend.length + 1] =
                new AttachmentBuilder(await fs.promises.readFile(path));
              await fs.promises.unlink(path);
            });
          });
          if (message.reference != undefined) {
            const messageContent = message.content.replace("lee:", "");

            const originalMessage = message.channel.messages.cache.get(
              message.reference.messageId,
            );

            await originalMessage.reply({
              content: messageContent,
              files: attachmentsSend,
            });
          } else {
            const messageContent = message.content.replace("lee:", "");

            await message.channel.send({
              content: messageContent,
              files: attachmentsSend,
            });
          }
          return;
        }

        var data = readUserData();

        function registerUser(id, username) {
          data[id] = {
            username: username,
            leebux: 0,
            daily_reset: 0,
          };
          writeUserData(data[id], id);
          return data[id];
        }

        var userData =
          data[message.member.user.id] ||
          registerUser(message.member.user.id, message.member.user.username);

        userData.leebux += 0.25;
        writeUserData(userData, message.member.user.id);
      });

      const tempDirPath = path.join(leedir, "temp");
      try {
        if (!fs.existsSync(tempDirPath)) {
          fs.mkdirSync(tempDirPath, { recursive: true });
          console.log("[lee.js:238]created temp directory!");
        }
      } catch (err) {
        console.error("Failed to create temp directory:", err);
      }

      process.on("unhandledRejection", async (error) => {
        await lastChannel.send({
          content: "An error occured!",
          files: [path.join(leedir, "temp/errorDetails.txt")],
        });
      });

      client.login(token);
    }

    try {
      main();
    } catch (err) {
      console.error("[lee.js:258]", err);
      fs.promises
        .writeFile(
          path.join(leedir, "temp/errorDetails.txt"),
          err?.stack || err?.message || String(err),
          "utf-8",
        )
        .then(async () => {
          await lastChannel.send({
            content: "An error occured!",
            files: [path.join(leedir, "temp/errorDetails.txt")],
          });
        });
    }
  },
};
