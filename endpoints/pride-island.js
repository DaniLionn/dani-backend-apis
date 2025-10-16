const fsPromises = require("fs/promises");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

var clientReady = false;

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function fetchAnnouncements(id) {
  const channel = client.channels.cache.get(id);
  let messages = [];
  await channel.messages.fetch({ limit: 10 }).then((msgs) => {
    msgs
      .filter((msg) => {
        return (
          msg.content.includes("<@&1194080682197131304>") &&
          msg.author.id == process.env.OWNER_ID
        );
      })
      .forEach((msg) => {
        let content = msg.content;
        (content = content.replace(
          /(?:https?|ftp):\/\/[\n\S]+/g,
          "(Link has been removed for Roblox)"
        )),
          (content = content.replace(/<@.?[0-9]*?>+/g, ""));
        content = content.replace(/<#.?[0-9]*?>+/g, "");
        content = content.replace(/[#|]+/g, "");
        messages.push([content, msg.createdTimestamp]);
      });
  });
  return messages;
}

module.exports = {
  "init/function": function () {
    client.on("clientReady", () => {
      console.log(`[pride-island.js:41] Logged in as ${client.user.tag}!`);
      clientReady = true;
    });

    client.login(process.env.PRIDEBOT_TOKEN);
  },

  "get/pride-island/rules": async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(
      await fsPromises.readFile("./data/pride-island-rules.json", "utf8")
    );
  },

  "get/pride-island/announcements": async function (req, res) {
    try {
      const announcements = await fetchAnnouncements(
        process.env.ANNOUNCEMENTS_CHANNEL_ID
      );

      res.send(announcements);
    } catch (err) {}
  },

  "get/pride-island/latestChangelogs": async function (req, res) {
    if (!clientReady) {
      while (!clientReady) {
        await delay(1);
      }
    }

    let updates = {};
    let channel = client.channels.cache.get("1214304064830177330");
    let key = 1;
    channel.messages
      .fetch({ limit: (req.query.limit > 25 && 25) || req.query.limit || 5 })
      .then((messages) => {
        messages.forEach((message) => {
          let embeddedMessage = message.embeds[0];

          let updateData = {
            date: "",
            changes: [],
          };

          const matches = embeddedMessage.title.match(
            /\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}\s(?:AM|PM)\s\w{3}/
          );
          if (matches) {
            const extractedDateTime = matches[0];
            updateData.date = extractedDateTime;
          }

          for (let index = 0; index < embeddedMessage.fields.length; index++) {
            const change = embeddedMessage.fields[index].name;
            updateData.changes.push(change);
          }

          updates[key] = updateData;

          key++;
        });
      })
      .then(() => {
        res.send(updates);
      })
      .catch((err) => {
        res.send(err.message);
      });
  },

  "get/pride-island/launch/server/:jobId": function (req, res) {
    let jobId = req.params["jobId"];

    if (jobId) {
      console.log(jobId);
      res.redirect(
        301,
        `roblox://experiences/start?placeId=10234861304&gameInstanceId=${jobId}`
      );
    }
  },

  "get/pride-island/launch": function (req, res) {
    res.redirect(301, `roblox://experiences/start?placeId=10234861304`);
  },

  "post/pride-island/addChangelog": async function (req, res) {
    try {
      const changelogData = JSON.parse(req.body.data);
      console.log(changelogData);
      const changelogEmbed = new EmbedBuilder();

      changelogEmbed.setColor(0xc48236);
      changelogEmbed.setTitle(
        `New Pride Island Update! (${changelogData.date} MST)`
      );
      for (let i = 0; i < changelogData.changes.length; i++) {
        changelogEmbed.addFields({
          name: `${i + 1}. ${changelogData.changes[i]}`,
          value: "\u200B",
        });
      }
      await client.channels.cache
        .get("1214304064830177330")
        .send({ embeds: [changelogEmbed] });

      res.send("ok");
    } catch (err) {
      res.send(err);
    }
  },
};
