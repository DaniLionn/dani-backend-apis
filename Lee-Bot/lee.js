const fs = require("node:fs");
const fsPromises = require("node:fs").promises;
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  AttachmentBuilder,
} = require("discord.js");
const { download } = require("./scripts/utils");

const token = process.env.LEE_TOKEN;

const statsTemplate = {
  commands_executed: 0,
};

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

module.exports = {
  startLee: function () {
    async function main() {
      console.log("starting lee");
      async function readStats() {
        const read = await fsPromises.readFile("./Lee-Bot/stats.json", "utf-8");

        return JSON.parse(read);
      }

      async function writeStats(statistic, increment) {
        const read = await fsPromises.readFile("./Lee-Bot/stats.json", "utf-8");
        var stats = JSON.parse(read);

        stats[statistic] += increment;

        await fsPromises.writeFile(
          "./stats.json",
          JSON.stringify(stats),
          "utf8",
        );
      }

      client.once(Events.ClientReady, async (readyClient) => {
        console.log(`[lee.js:53] Ready! Logged in as ${readyClient.user.tag}`);
        require("./scripts/deploy-commands");
        // async function setStatus() {
        //   var executedCommands = await readStats();

        //   client.user.setActivity(
        //     "for commands | " +
        //       executedCommands["commands_executed"].toLocaleString("en-US") +
        //       " commands executed so far",
        //     { type: ActivityType.Watching },
        //   );
        // }

        // await setStatus();

        // setInterval(async () => {
        //   await setStatus();
        // }, 180_000);
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
          // Set a new item in the Collection with the key as the command name and the value as the exported module
          if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
          } else {
            console.log(
              `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
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
          console.error("Command execution error:", error);
          // Safe write to file
          try {
            await fsPromises.writeFile(
              "./temp/errorDetails.txt",
              "Error Details:\n" +
                (error?.stack || error?.message || String(error)),
            );
          } catch (fsWriteError) {
            console.error("Failed to write error details file:", fsWriteError);
          }

          // Safe interaction response
          try {
            const response = {
              content:
                "There was an error while executing this command!\n(Don't worry if you don't understand this, this is just here for debugging purposes.)",
              files: ["./temp/errorDetails.txt"],
            };

            if (interaction.replied || interaction.deferred) {
              await interaction.followUp(response);
            } else {
              await interaction.reply(response);
            }
          } catch (interactionError) {
            console.error("Failed to reply to interaction:", interactionError);
          }

          // Safe file cleanup
          try {
            await fsPromises.unlink("./temp/errorDetails.txt");
          } catch (fsDeleteError) {
            console.error(
              "Failed to delete error details file:",
              fsDeleteError,
            );
          }
        } finally {
          // Always write stats, but catch if it fails
          try {
            await writeStats("commands_executed", 1);
          } catch (statsError) {
            console.error("Failed to write command stats:", statsError);
          }
        }
      });

      client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) {
          return;
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
            await download(attachment.url).then((path) => {
              attachmentsSend[attachmentsSend.length + 1] =
                new AttachmentBuilder(fsPromises.readFile(path));
              fsPromises.unlink(path);
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
        }
      });

      if (!fs.existsSync("./Lee-Bot/temp")) {
        fs.mkdir("./Lee-Bot/temp", function (err) {
          if (err) {
            console.error(err);
            return;
          }

          console.log("created temp directory!");
        });
      }

      if (!fs.existsSync(path.join(__dirname, "./Lee-Bot/stats.json"))) {
        fs.writeFileSync(
          "./Lee-Bot/stats.json",
          JSON.stringify(statsTemplate),
          function (err) {
            if (err) {
              console.err(err);
              return;
            }

            console.log("created temp directory!");
          },
        );
      }

      process.on("unhandledRejection", async (error) => {
        await lastChannel.send({
          content: "An error occured!",
          files: ["./Lee-Bot/temp/errorDetails.txt"],
        });
      });

      // Log in to Discord with your client's token

      const files = await fsPromises.readdir("./Lee-Bot/temp");

      files.forEach(async (file) => {
        await fsPromises.unlink(path.join("./Lee-Bot/temp", file));
      });

      client.login(token);
    }

    try {
      main();
    } catch (err) {
      console.error(err);
      fsPromises
        .writeFile("./Lee-Bot/temp/errorDetails.txt", err, "utf-8")
        .then(async () => {
          await lastChannel.send({
            content: "An error occured!",
            files: ["./Lee-Bot/temp/errorDetails.txt"],
          });
        });
    }
  },
};
