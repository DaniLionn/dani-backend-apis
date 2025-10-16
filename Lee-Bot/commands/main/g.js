const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("g")
    .setDescription("i wonder what it does?"),
  async execute(interaction) {
    await interaction.reply(
      "https://danilionn.github.io/dani-cdn/assets/project-assets/danibot/images/giratiba/giratiba.png",
    );
  },
};
