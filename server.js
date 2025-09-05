const dotenv = require("dotenv");
dotenv.config();

const started = new Date().getTime();
const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const fsPromises = require("fs/promises");
const fs = require("fs");
const { start } = require("repl");
const { time } = require("console");

const app = express();
app.use(express.json({ limit: "512kb" }));

//start pride island apis
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

app.get("/pride-island/rules", async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(await fsPromises.readFile("./data/pride-island-rules.json", "utf8"));
});

app.get("/pride-island/announcements", async function (req, res) {
  try {
    const announcements = await fetchAnnouncements(
      process.env.ANNOUNCEMENTS_CHANNEL_ID
    );

    res.send(announcements);
  } catch (err) {}
});

app.get("/pride-island/latestChangelogs", async (req, res) => {
  if (!clientReady) {
    while (!clientReady) {
      await delay(1);
    }
  }

  let updates = {};
  let channel = client.channels.cache.get("1214304064830177330");
  let key = 1;
  channel.messages
    .fetch({ limit: req.query.limit })
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
});

app.get("/pride-island//launch/server/:jobId", (req, res) => {
  let jobId = req.params["jobId"];

  if (jobId) {
    console.log(jobId);
    res.redirect(
      301,
      `roblox://experiences/start?placeId=10234861304&gameInstanceId=${jobId}`
    );
  }
});

app.get("/pride-island/launch", (req, res) => {
  res.redirect(301, `roblox://experiences/start?placeId=10234861304`);
});

app.post("/pride-island/addChangelog", async (req, res) => {
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
    console.log("sending");
    await client.channels.cache
      .get("1214304064830177330")
      .send({ embeds: [changelogEmbed] });

    res.send("ok");
  } catch (err) {
    res.send(err);
  }
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  clientReady = true;
});

client.login(process.env.PRIDEBOT_TOKEN);
//end pride island apis

//start main apis
app.get("/main/time/:region/:city", function (req, res) {
  const region = req.params.region;
  const city = req.params.city;

  timezone = `${region}/${city}`;

  if (!region || !city || (!region && !city)) {
    res.status(400).send("No timezone specified.");
  }

  const date = new Date();

  var options;

  options = {
    timeZone: timezone,
  };

  let d = date.toLocaleDateString("en-US", options);
  let dateSplit = d.split("/");
  let t = date.toLocaleTimeString("en-US", options);
  let timeSplit = t.split(":");
  let AMPM = timeSplit[2].split(" ")[1].replace(/\\s+/g, "");
  let second = timeSplit[2].split(" ")[0];

  let northernHemisphereSeason;
  let southernHemisphereSeason;

  if (dateSplit[0] == "12" || dateSplit[0] == "1" || dateSplit[0] == "2") {
    northernHemisphereSeason = "Winter";
    southernHemisphereSeason = "Summer";
  } else if (
    dateSplit[0] == "3" ||
    dateSplit[0] == "4" ||
    dateSplit[0] == "5"
  ) {
    northernHemisphereSeason = "Spring";
    southernHemisphereSeason = "Fall";
  } else if (
    dateSplit[0] == "6" ||
    dateSplit[0] == "7" ||
    dateSplit[0] == "8"
  ) {
    northernHemisphereSeason = "Summer";
    southernHemisphereSeason = "Winter";
  } else if (
    dateSplit[0] == "9" ||
    dateSplit[0] == "10" ||
    dateSplit[0] == "11"
  ) {
    northernHemisphereSeason = "Fall";
    southernHemisphereSeason = "Spring";
  }

  let data = {
    data: {
      date: {
        month: dateSplit[0],
        day: dateSplit[1],
        year: dateSplit[2],
      },
      time: {
        hour: timeSplit[0],
        minute: timeSplit[1],
        second: second,
        AMPM: AMPM,
      },
      seasonNH: northernHemisphereSeason,
      seasonSH: southernHemisphereSeason,
      timeZone: timezone,
      requestFufilled: Math.floor(Date.now() / 1000),
    },
  };

  res.send(data);
});

//end main apis

app.get("/", async function (_, res) {
  const timePassed = new Date().getTime() - started;

  res.send(
    `<!DOCTYPE html>
<html>
  <head>
    <style>
      h1 {text-align: center;}
      p {text-align: center;}
      img {text-align: center;}
      .center {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 10%;
      }
    </style>
  </head>
  <body>
    <h1>Dani's API Server</h1>
    <img src="https://danilionn.github.io/dani-cdn/assets/general/images/fish.gif" alt="funny fish gif" class="center">
    <p>APIs for my various projects</p>
      
    <p>Uptime (as of page load): ${new Date(timePassed)
      .toISOString()
      .slice(11, 19)}</p>
  </body>
</html>`
  );
});

app.listen(process.env.PORT || 3000);
