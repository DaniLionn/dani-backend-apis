const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContextMenuCommandType,
} = require("discord.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { until } = require("flipnote.js/utils");

const images = fs.readdirSync("./Lee-Bot/assets/tomolife-zoom-images");

function extractNameFromImage(img) {
  function titleCase(str) {
    let splitStr = str.toLowerCase().split(" ");
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(" ");
  }

  return titleCase(
    path
      .basename(img)
      .replace(path.extname(img), "")
      .replace("TC_", "")
      .replace("TL_Food_", "")
      .replace("_sprite", "")
      .replace("_", " "),
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("zoom-quiz")
    .setDescription("based on the minigame from tomodachi life"),
  async execute(interaction) {
    await interaction.reply("Setting up...");

    let stage = 0;
    const foodNames = [];
    let zoom = 70;
    let coords = 20;

    let filter = (m) => {
      m.deferUpdate();
      return m.user.id === interaction.user.id;
    };

    let lost = false;

    const messages = [
      "Here's your first zoomed in food item. What is it?",
      "Correct!\nHere's your second zoomed in food item. What is it?",
      "Correct!\nHere's your final zoomed in food item. What is it?",
    ];

    let buttons = [];

    //generate images and setup buttons
    for (let i = 0; i < 3; i++) {
      zoom -= 10;
      coords += 10;

      let randomFood = images[Math.floor(Math.random() * images.length)];
      foodNames[i] = extractNameFromImage(randomFood);

      let copyPath = process.env.LEE_DATA_DIR + "/food" + (i + 1) + ".png";
      await fs.promises.copyFile(
        "./Lee-Bot/assets/tomolife-zoom-images/" + randomFood,
        copyPath,
      );

      await sharp(await fs.promises.readFile(copyPath))
        .extract({
          left: coords,
          top: coords,
          width: zoom,
          height: zoom,
        })
        .toFile(copyPath);

      await sharp(await fs.promises.readFile(copyPath))
        .resize(120, 120)
        .toFile(copyPath);

      let buttonSet = [];

      for (let j = 0; j < 3; j++) {
        let newbutton = new ButtonBuilder();

        buttonSet.push(newbutton);
      }

      const correct = Math.floor(Math.random() * 3);

      const correctButton = buttonSet[correct];
      correctButton.setLabel(foodNames[i]);
      correctButton.setCustomId("right");
      correctButton.setStyle(ButtonStyle.Primary);

      let wrongFood1 = extractNameFromImage(
        images[Math.floor(Math.random() * images.length)],
      );

      let wrongFood2 = extractNameFromImage(
        images[Math.floor(Math.random() * images.length)],
      );

      if (wrongFood1 === foodNames[i]) {
        while (wrongFood1 === foodNames[i]) {
          wrongFood1 = extractNameFromImage(
            images[Math.floor(Math.random() * images.length)],
          );
        }
      }

      if (wrongFood2 === foodNames[i]) {
        while (wrongFood2 === foodNames[i]) {
          wrongFood2 = extractNameFromImage(
            images[Math.floor(Math.random() * images.length)],
          );
        }
      }

      if (correct === 0) {
        buttonSet[1]
          .setLabel(wrongFood1)
          .setCustomId("wrong")
          .setStyle(ButtonStyle.Primary);
        buttonSet[2]
          .setLabel(wrongFood2)
          .setCustomId("wrong2")
          .setStyle(ButtonStyle.Primary);
      }

      if (correct === 1) {
        buttonSet[0]
          .setLabel(wrongFood1)
          .setCustomId("wrong")
          .setStyle(ButtonStyle.Primary);
        buttonSet[2]
          .setLabel(wrongFood2)
          .setCustomId("wrong2")
          .setStyle(ButtonStyle.Primary);
      }

      if (correct === 2) {
        buttonSet[0]
          .setLabel(wrongFood1)
          .setCustomId("wrong")
          .setStyle(ButtonStyle.Primary);
        buttonSet[1]
          .setLabel(wrongFood2)
          .setCustomId("wrong2")
          .setStyle(ButtonStyle.Primary);
      }

      buttons.push(
        new ActionRowBuilder().addComponents(
          buttonSet[0],
          buttonSet[1],
          buttonSet[2],
        ),
      );
    }

    //actually play the game now

    async function del() {
      await fs.promises.unlink(process.env.LEE_DATA_DIR + "/food1.png");
      await fs.promises.unlink(process.env.LEE_DATA_DIR + "/food2.png");
      await fs.promises.unlink(process.env.LEE_DATA_DIR + "/food3.png");
    }

    await interaction.editReply({
      content: messages[0],
      files: [process.env.LEE_DATA_DIR + "/food1.png"],
      components: [buttons[0]],
    });

    let collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "wrong") {
        await interaction.editReply({
          content: "Aww, too bad! The correct answer was " + foodNames[stage],
          files: [],
          components: [],
        });

        await del();
      }

      if (i.customId === "wrong2") {
        await interaction.editReply({
          content: "Aww, too bad! The correct answer was " + foodNames[stage],
          files: [],
          components: [],
        });

        await del();
      }

      if (i.customId === "right") {
        await interaction.editReply({
          content: messages[1],
          files: [process.env.LEE_DATA_DIR + "/food2.png"],
          components: [buttons[1]],
        });

        let collector2 = interaction.channel.createMessageComponentCollector({
          filter,
          time: 15000000,
          max: 1,
        });

        collector2.on("collect", async (i) => {
          if (i.customId === "wrong") {
            await interaction.editReply({
              content:
                "Aww, too bad! The correct answer was " + foodNames[stage],
              files: [],
              components: [],
            });

            await del();
          }

          if (i.customId === "wrong2") {
            await interaction.editReply({
              content:
                "Aww, too bad! The correct answer was " + foodNames[stage],
              files: [],
              components: [],
            });

            await del();
          }

          if (i.customId === "right") {
            await interaction.editReply({
              content: messages[2],
              files: [process.env.LEE_DATA_DIR + "/food3.png"],
              components: [2],
            });

            let collector3 =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 15000000,
                max: 1,
              });

            collector3.on("collect", async (i) => {
              if (i.customId === "wrong") {
                await interaction.editReply({
                  content:
                    "Aww, too bad! The correct answer was " + foodNames[stage],
                  files: [],
                  components: [],
                });

                await del();
              }

              if (i.customId === "wrong2") {
                await interaction.editReply({
                  content:
                    "Aww, too bad! The correct answer was " + foodNames[stage],
                  files: [],
                  components: [],
                });

                await del();
              }

              if (i.customId === "right") {
                await interaction.editReply({
                  content: "You win!",
                  files: [],
                  components: [],
                });

                await del();
              }
            });
          }
        });
      }
    });
  },
};
