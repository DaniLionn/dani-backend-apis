const fsPromises = require("fs/promises");
const fs = require("fs");
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
        ((content = content.replace(
          /(?:https?|ftp):\/\/[\n\S]+/g,
          "(Link has been removed for Roblox)"
        )),
          (content = content.replace(/<@.?[0-9]*?>+/g, "")));
        content = content.replace(/<#.?[0-9]*?>+/g, "");
        content = content.replace(/[#|]+/g, "");
        messages.push([content, msg.createdTimestamp]);
      });
  });
  return messages;
}

function checkPhoneNumberValueExists(data, newPhoneNumberValue) {
  var valueExists = false;

  for (const entry in data.phoneData) {
    const phoneEntries = data.phoneData[entry];

    for (const userId of Object.keys(phoneEntries)) {
      const phoneEntries = data.phoneData[entry];

      const phoneNumber = phoneEntries[userId];

      if (phoneNumber === newPhoneNumberValue) {
        valueExists = true;
        break;
      }
    }
    return valueExists;
  }
}

function addPhoneNumberToList(data, userID, newPhoneNumber) {
  data.phoneData[userID] = newPhoneNumber;
}

function generateNumber() {
  let number1 = (Math.floor(Math.random() * 999) + 1).toString();

  if (Number(number1) < 10) {
    number1 = `0${number1}`;
  }

  let number2 = (Math.floor(Math.random() * 999) + 1).toString();

  if (Number(number2) < 10) {
    number2 = `0${number2}`;
  }

  let number3 = (Math.floor(Math.random() * 999) + 1).toString();

  if (Number(number3) < 10) {
    number3 = `0${number3}`;
  }

  let finalNumber = `${number1}-${number2}-${number3}`;
  return finalNumber;
}

function writeDataToFile(data, filename) {
  fss.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log("Data has been updated and written to the file");
  });
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

  "get/pride-island/listNumbers": function (req, res) {
    fss.readFile("/var/data/phone.json", "utf8", function (err, data) {
      if (err) {
        console.err(err);
      }

      res.send(JSON.parse(data));
    });
  },

  "get/pride-island/getNumber": function (req, res) {
    const userID = req.query.userID;

    if (!userID) {
      res
        .status(400)
        .send(
          "<!DOCTYPE html> <html> <body> <h1>400 Bad Request</h1> <hr> <h3>UserID isn't valid! (userID query wasn't passed)</h3> </html> </body>"
        );
      return;
    }

    if (Number(userID) < 1) {
      res
        .status(400)
        .send(
          "<!DOCTYPE html> <html> <body> <h1>400 Bad Request</h1> <hr> <h3>UserID isn't valid! (smaller than 1)</h3> </html> </body>"
        );
      return;
    }

    let number;

    fss.readFile("/var/data/phone.json", "utf8", function (err, data) {
      var json = JSON.parse(data);

      for (var i = 0; i < json.phoneData.length; i++) {
        if (json.phoneData[i][userID]) {
          console.log(
            `number already exists for userId ${userID}. sending number...`
          );
          res.send(json.phoneData[i][userID]);
          return;
        }
      }

      console.log(
        `no number exists for userId ${userID}. regestering new number!`
      );

      var numberExists = true;
      do {
        //updated range of random numbers from 99 to 999 on 6/23/2024 3:56 pm
        //changing the amount of valid phone numbers from 970,299
        //to 997,002,999
        //unless we somehow get almost 1 billion unique players we're
        //not going to run out anytime soon 😝
        var number = generateNumber();
        numberExists = checkPhoneNumberValueExists(json, number);
      } while (numberExists);

      addPhoneNumberToList(json, userID, number);
      writeDataToFile(json, "/var/data/phone.json");
      res.send(number);
    });
  },

  "get/pride-island/getUserIDViaNumber": function (req, res) {
    const userID = req.query.number;
    let number;

    fss.readFile("/var/data/phone.json", "utf8", function (err, data) {
      var json = JSON.parse(data);

      for (var i = 0; i < json.phoneData.length; i++) {
        if (json.phoneData[i]) {
          var p = json.phoneData[i];
          //console.log(p)
          for (var key in p) {
            //console.log(key)
            var value = p[key];
            if (value == userID) {
              // Corrected the comparison operation here
              console.log("found");
              res.send(key);
              return;
            }
          }
        }
      }
    });
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
