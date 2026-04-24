const fs = require("node:fs");
const {
  Client,

  Events,
  AttachmentBuilder, GatewayIntentBits,
} = require("discord.js");

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
  startLoo: async function() {
    async function main() {
      console.log("[loo.js] Starting loo bot!");

      client.once(Events.ClientReady, async (readyClient) => {


        console.log(`[loo.js] Ready! Logged in as ${readyClient.user.tag}`);
      });

      client.on(Events.MessageCreate, async (message) => {
        console.log("message created!", message.content);

        if (message.author.bot) {
          return;
        }
        if (
          message.content.startsWith("loo:")
        ) {



          await message.channel.sendTyping();
          const attachmentsGrab = message.attachments;

          let attachmentsSend = []
          for (const attachment of attachmentsGrab) {
            await download(attachment[1].url, process.env.LEE_DATA_DIR, attachment[1].name).then(async (path) => {
              const a =  new AttachmentBuilder(path);
              attachmentsSend.push({attachment: a.attachment, name: attachment[1].name})


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
              await fs.promises.unlink(attachment)
            }
          } else {
            const messageContent = message.content.replace("lee:", "");

            await message.channel.send({
              content: messageContent,
              files: attachmentsSend,
            });
          }

          await message.delete();
          return;
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
