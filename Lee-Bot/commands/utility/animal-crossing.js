const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const animalCrossingData = require("animal-crossing");
const { download } = require("../../utils/scripts/utils");
const fs = require("node:fs");
const path = require("node:path");
const ids = [
  //species id | # of animals
  ["ant", 10], //anteater
  ["bea", 16], //bear
  ["brd", 21], //bird
  ["bul", 9], //bull
  ["cat", 24], //cat
  ["cbr", 20], //bear cub
  ["chn", 20], //chicken
  ["cow", 8], //cow
  ["crd", 9], //alligator
  ["der", 13], //deer
  ["dog", 19], //dog
  ["duk", 18], //duck
  ["elp", 13], //elephant
  ["flg", 20], //frog
  ["goa", 10], //goat
  ["gor", 12], //gorilla
  ["ham", 10], //hamster
  ["hip", 10], //hippo
  ["hrs", 17], //horse
  ["kal", 11], //koala
  ["kgr", 11], //kangaroo
  ["lon", 9], //lion
  ["mnk", 10], //monkey
  ["mus", 20], //mouse
  ["ocp", 5], //octopus
  ["ost", 11], //ostrich
  ["pbr", 11], //eagle
  ["pgn", 15], //penguin
  ["pig", 18], //pig
  ["rbt", 22], //rabbit
  ["shp", 16], //sheep
  ["squ", 22], //squirrel
  ["tig", 7], //tiger
  ["wol", 13], //wolf
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("animal-crossing-random-villager")
    .setDescription("gives a random animal crossing villager. no 2.0 or 3.0 sadly"),
  async execute(interaction) {
    await interaction.deferReply();
    const entry = ids[Math.floor(Math.random() * ids.length)];

    var number = Math.floor(Math.random() * entry[1]);

    if (number < 10) {
      number = "0" + number.toString();
    }

    const animalID = entry[0] + number;

    const animal = animalCrossingData.villagers.find(
      (villager) => villager.filename === animalID,
    );

    if (animal) {
      await download(animal.photoImage, process.env.LEE_DATA_DIR).then(
        async (filePath) => {
          const embed = new EmbedBuilder();

          embed.setTitle(animal.name);
          embed.setDescription(`*"${animal.favoriteSaying}"*`);
          embed.setColor(animal.bubbleColor);
          embed.setImage(`attachment://${path.basename(filePath)}`);
          embed.setFooter({ text: animalID });
          await interaction.editReply({ embeds: [embed], files: [filePath] });

          await fs.promises.unlink(filePath);
        },
      );
    } else {
      await interaction.editReply("No animal found!");
    }
  },
};
