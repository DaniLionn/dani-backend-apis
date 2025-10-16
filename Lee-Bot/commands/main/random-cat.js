const { download } = require("../../scripts/utils");
const { unlink } = require("fs/promises");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-cat")
    .setDescription("sends a random cat pic"),
  async execute(interaction) {
    await interaction.deferReply();
    download("https://cataas.com/cat", "./temp").then(async (filepath) => {
      await interaction.editReply({ files: [filepath] });
      await unlink(filepath);
    });
  },
};
