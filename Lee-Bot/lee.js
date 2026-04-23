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
const { Octokit } = require("octokit");
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

const date = new Date();

const currentYear = date.getFullYear();
const Day = date.getDate();
const Month = date.getMonth();

let randomStatuses = [
  [ActivityType.Playing, "Playing Lee Wars 2007"],
  [
    ActivityType.Competing,
    "Competing in hottest bot championships " + currentYear,
  ],
  [ActivityType.Custom, "🪵"],
  [ActivityType.Custom, "i am lee bot"],
  [
    ActivityType.Custom,
    "i fall asleep to the sound of a dial up modem dialing",
  ],
  [
    ActivityType.Competing,
    `Competing in the biggest fart competition ${currentYear} (and winning 😄)`,
  ],
  [
    ActivityType.Competing,
    `Competing in the biggest fart competition ${currentYear} (and losing to PLACEHOLDER)`,
  ],
  [ActivityType.Custom, "the voices."],
  [
    ActivityType.Custom,
    "is it just me or is it hot in here? *fade to picture of carrot*",
  ],
  [ActivityType.Custom, "Lee ✌️😂"],
  [ActivityType.Custom, "Eating a. Joo loo"],
  [
    ActivityType.Custom,
    "woah i thing i 'm adicted im adicted to lveo i'm otu of sync self inflicted but ut fits like a glove",
  ],
];

const leeDir = process.env.LEE_ROOT_DIR;
let turns = 0;
module.exports = {
  startLee: async function() {
    async function main() {
      console.log("[lee.js:74] Starting lee bot!");

      client.once(Events.ClientReady, async (readyClient) => {
        async function setStatus() {
          if (Day === 1 && Month === 3) {
            if (client.user.username !== "Neon Green") {
              await client.user.setUsername("Neon Green");
              await client.user.setPresence({
                activities: [{ name: "Green", type: ActivityType.Custom }],
              });
              await client.user.setBanner("Lee-Bot/assets/neon green.png");
              await client.user.setAvatar("Lee-Bot/assets/neon green.png");
            }


          }

          else if (Day === 23 && Month === 3) {
            if (client.user.username !== "Birthday Girl Lee") {
              await client.user.setUsername("Birthday Girl Lee")
              await client.user.setBanner("./Lee-Bot/assets/banners/birthday_banner.jpg");
              await client.user.setAvatar("Lee-Bot/assets/lee_bday.png");

            }
            await client.user.setPresence({
              activities: [{ name: "Having a robot birthday bash with Loo and the gang" , type: ActivityType.Custom }],
            });

          }

          else {
            if (client.user.username !== "Lee Joe Smith") {
              await client.user.setUsername("Lee Joe Smith");
            }

            const randomStatus = randomSelect(randomStatuses);

            if (randomStatus === randomStatuses[6]) {
              const randomGuy = await randomUser(client);
              randomStatus[1] = randomStatuses[6][1].replace(
                "PLACEHOLDER",
                randomGuy.displayName || randomGuy.username,
              );
            }

            function randomizeBanner() {
              const banners = [
                "./Lee-Bot/assets/banners/banner1.png",
                "./Lee-Bot/assets/banners/banner2.jpg",
                "./Lee-Bot/assets/banners/banner3.jpg",
                "./Lee-Bot/assets/banners/banner4.jpg",
                "./Lee-Bot/assets/banners/banner5.png",
                "./Lee-Bot/assets/banners/banner6.png",
                "./Lee-Bot/assets/banners/banner7.png",
                "./Lee-Bot/assets/banners/banner8.png",
                "./Lee-Bot/assets/banners/banner9.png",
                "./Lee-Bot/assets/banners/lee dance.gif",
              ];
              const random =
                banners[Math.floor(Math.random() * banners.length)];
              console.log(random);
              client.user.setBanner(random);
            }

            if (randomStatus === randomStatuses[7]) {
              await client.user.setAvatar("./Lee-Bot/assets/lee_voices.png");
              turns = 1;
            } else {
              if (turns === 0) {
                turns = Math.floor(Math.random() * 3) + 2;
                if (Math.random() <= 0.15) {
                  await client.user.setAvatar("./Lee-Bot/assets/lee_rare.jpg");
                  randomizeBanner();
                } else if (Math.random() <= 0.05) {
                  await client.user.setAvatar(
                    "./Lee-Bot/assets/scag-takeover.gif",
                  );
                 await client.user.setBanner("./Lee-Bot/assets/scag.png");
                } else {
                  await client.user.setAvatar("./Lee-Bot/assets/lee_new.png");
                  randomizeBanner();
                }
              } else {
                turns -= 1;
              }
            }
            client.user.setPresence({
              activities: [{ name: randomStatus[1], type: randomStatus[0] }],
            });
          }
        }

        async function checkForGithubUpdates(data) {
          async function updateCheck(o, r) {
            const data = await octokit.request(
              "GET /repos/{owner}/{repo}/releases",
              {
                owner: o,
                repo: r,
              },
            );

            const latest = data.data[0];
            const tag = latest.tag_name;

            if (
              !fs.existsSync(path.join(process.env.LEE_DATA_DIR, `last${r}Ver`))
            ) {
              fs.writeFileSync(
                path.join(process.env.LEE_DATA_DIR, `last${r}Ver`),
                "v0",
              );
            }

            if (
              fs.readFileSync(
                path.join(process.env.LEE_DATA_DIR, `last${r}Ver`),
              ) !== tag
            ) {
              fs.writeFileSync(
                path.join(process.env.LEE_DATA_DIR, `last${r}Ver`),
                tag,
              );

              await client.channels.cache
                .get("1479729565810163834")
                .send(
                  `<@599641108116406300>\nNew ${r} update!\n${latest.name}\nhttps://github.com/${o}/${r}/releases/latest`,
                );
            }
          }

          for (const repo of data) {
            await updateCheck(repo.owner, repo.name);
          }
        }

        async function updateCheck() {
          await checkForGithubUpdates([
            { owner: "DS-Homebrew", name: "TwilightMenu" },
            { owner: "DS-Homebrew", name: "GodMode9i" },
            { owner: "mq1", name: "TinyWiiBackupManager" },
            { owner: "solosky", name: "pixl.js" },
            { owner: "LNH-team", name: "pico-loader" },
            { owner: "LNH-team", name: "pico-launcher" },
          ]);
        }

        console.log(`[lee.js:74] Ready! Logged in as ${readyClient.user.tag}`);
        require("./scripts/deploy-commands");
        await setStatus();
        await updateCheck();

        setInterval(updateCheck, 3_600_000);
        setInterval(setStatus, 5 * 60_000);
      });

      client.commands = new Collection();

      const foldersPath = path.join(__dirname, "commands");
      const commandFolders = fs.readdirSync(foldersPath);

      let lastChannel;

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
              `[lee.js:179] [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
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
              path.join(leeDir, "temp/errorDetails.txt"),
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
              files: [path.join(leeDir, "temp/errorDetails.txt")],
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
              path.join(leeDir, "temp/errorDetails.txt"),
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

        //enforce the "no letter f" rule in the phighting channel in The Hakurei Family
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



          await message.channel.sendTyping();
          const attachmentsGrab = message.attachments;

          let attachmentsSend = []
          for (const attachment of attachmentsGrab) {
            console.log(attachment);
            await download(attachment[1].url, process.env.LEE_DATA_DIR, attachment[1].name).then(async (path) => {
              const a =  new AttachmentBuilder(path);
              attachmentsSend.push({attachment: a.attachment, name: attachment[1].name})


            });
          }

          console.log(attachmentsSend);

          if (message.reference !== null) {
            const messageContent = message.content.replace("lee:", "");

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

        let data = readUserData();

        function registerUser(id, username) {
          data[id] = {
            username: username,
            leebux: 0,
            daily_reset: 0,
          };
          writeUserData(data[id], id);
          return data[id];
        }

        let userData =
          data[message.member.user.id] ||
          registerUser(message.member.user.id, message.member.user.username);

        userData.leebux += 0.25;
        writeUserData(userData, message.member.user.id);
      });

      const tempDirPath = path.join(leeDir, "temp");
      try {
        if (!fs.existsSync(tempDirPath)) {
          fs.mkdirSync(tempDirPath, { recursive: true });
          console.log("[lee.js:238]created temp directory!");
        }
      } catch (err) {
        console.error("Failed to create temp directory:", err);
      }

      process.on("unhandledRejection", async () => {
        await lastChannel.send({
          content: "An error occurred!",
          files: [path.join(leeDir, "temp/errorDetails.txt")],
        });
      });

     await client.login(token);
    }

     try {
      await main();
    } catch (err) {
      console.error("[lee.js:258]", err);
      fs.promises
        .writeFile(
          path.join(leeDir, "temp/errorDetails.txt"),
          err?.stack || err?.message || String(err),
          "utf-8",
        )
        .then(async () => {
          await lastChannel.send({
            content: "An error occured!",
            files: [path.join(leeDir, "temp/errorDetails.txt")],
          });
        });
    }
  },
};
