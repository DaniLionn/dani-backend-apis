const fs = require("node:fs");
const fsPromises = require("node:fs").promises;
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  AttachmentBuilder,
} = require("discord.js");
const { download, status } = require("./scripts/utils");

const token = process.env.LEE_TOKEN;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const leedir = process.env.LEE_ROOT_DIR;

module.exports = {
  startLee: function () {
    async function main() {
      console.log("[lee.js:32] Starting lee bot!");

      client.once(Events.ClientReady, async (readyClient) => {
        console.log(`[lee.js:53] Ready! Logged in as ${readyClient.user.tag}`);
        require("./scripts/deploy-commands");
        await status(client);
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
              `[lee.js:93] [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
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
          // Safe write to file
          try {
            await fsPromises.writeFile(
              path.join(leedir, "temp/errorDetails.txt"),
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

          // Safe file cleanup
          try {
            await fsPromises.unlink(path.join(leedir, "temp/errorDetails.txt"));
          } catch (fsDeleteError) {
            console.error(
              "Failed to delete error details file:",
              fsDeleteError,
            );
          }
        }
      });

      client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) {
          return;
        }

        if (message.channel.id === "1417504755319701644") {
          if (message.content.toLowerCase().includes("f")) {
            await message.delete();
            var phixedMessage = message.content.replaceAll("f", "ph");

            const firstLetter = phixedMessage.split("")[0];
            const secondLetter = phixedMessage.split("")[1];
            if (
              firstLetter === firstLetter.toUpperCase() &&
              secondLetter === secondLetter.toLowerCase()
            ) {
              phixedMessage =
                "Ph" + phixedMessage.substring(2, phixedMessage.length);
            } else if (
              firstLetter === firstLetter.toUpperCase() &&
              secondLetter === secondLetter.toUpperCase()
            ) {
              phixedMessage =
                "PH" + phixedMessage.substring(2, phixedMessage.length);
            }

            message.channel.send({
              content: `<@${message.author.id}> You broke the "replace f with ph" rule! Did you mean to say "${phixedMessage}"?`,
            });
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

      const tempDirPath = path.join(leedir, "temp");
      try {
        if (!fs.existsSync(tempDirPath)) {
          fs.mkdirSync(tempDirPath, { recursive: true });
          console.log("[lee.js:217]created temp directory!");
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
      console.error(
        "[lee.js:257] " + err?.stack || err?.message || String(err),
      );
      fsPromises
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
