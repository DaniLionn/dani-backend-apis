const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const animalCrossingData = require("animal-crossing");
const { download } = require("../../scripts/utils");
const fs = require("fs");

const ids = [
  //species id | # of animals
  ["ant", 10], //anteater
  ["bea", 16], //bear
  ["brd", 21], //bird
  ["bul", 9], //bull
  ["cat", 24], //cat
  ["cbr", 24], //bear cub
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("animal-crossing-random-villager")
    .setDescription("gives a random animal crossing villager"),
  async execute(interaction) {
    await interaction.deferReply();
    const entry = ids[Math.floor(Math.random() * ids.length)];

    const animalID = entry[0] + Math.floor(Math.random() * entry[1]);
    console.log(animalID);

    const animal = animalCrossingData.villagers.find(
      (villager) => villager.filename == animalID,
    );

    if (animal) {
      const embed = new EmbedBuilder();

      embed.setTitle(animal.name);

      embed.setImage(animal.photoImage);

      const image = await download(animal.photoImage, process.env.LEE_DATA_DIR);

      await interaction.editReply({ embeds: [embed], files: [image] });
      await fs.promises.unlink(image);
    } else {
      await interaction.editReply("No animal found!");
    }
  },
};
