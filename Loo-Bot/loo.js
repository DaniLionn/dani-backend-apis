const fs = require("node:fs");
const {
  Client,
  Events,
  AttachmentBuilder,
  GatewayIntentBits,
  Collection,
} = require("discord.js");

const { download } = require("../../Lee-Bot/scripts/utils");
const path = require("node:path");

const token = process.env.LOO_TOKEN;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

module.exports = {
  startLoo: async function () {
    async function main() {
      console.log("[loo.js] Starting loo bot!");

      client.once(Events.ClientReady, async (readyClient) => {
        console.log(`[loo.js] Ready! Logged in as ${readyClient.user.tag}`);

        require("./scripts/deploy-commands");

        client.commands = new Collection();

        const foldersPath = path.join(__dirname, "commands");
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
                `[lee.js] [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
              );
            }
          }
        }
      });

      client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(
          interaction.commandName,
        );

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
              path.join(process.env.LEE_DATA_DIR, "/errorDetails.txt"),
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
              files: [path.join(process.env.LEE_DATA_DIR, "/errorDetails.txt")],
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
              path.join(process.env.LEE_DATA_DIR, "/errorDetails.txt"),
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
        if (message.author.bot) {
          return;
        }
        if (message.content.startsWith("loo:")) {
          await message.channel.sendTyping();
          const attachmentsGrab = message.attachments;

          let attachmentsSend = [];
          for (const attachment of attachmentsGrab) {
            await download(
              attachment[1].url,
              process.env.LEE_DATA_DIR,
              attachment[1].name,
            ).then(async (path) => {
              const a = new AttachmentBuilder(path);
              attachmentsSend.push({
                attachment: a.attachment,
                name: attachment[1].name,
              });
            });
          }

          if (message.reference !== null) {
            const messageContent = message.content.replace("loo:", "");

            const originalMessage = message.channel.messages.cache.get(
              message.reference.messageId,
            );

            await originalMessage.reply({
              content: messageContent,
              files: attachmentsSend,
            });

            for (const attachment of attachmentsSend) {
              await fs.promises.unlink(attachment);
            }
          } else {
            const messageContent = message.content.replace("loo:", "");

            await message.channel.send({
              content: messageContent,
              files: attachmentsSend,
            });
          }

          await message.delete();
        }
      });

      await client.login(token);
    }

    try {
      await main();
    } catch (err) {
      console.error("[loo.js]", err);
    }
  },
};
