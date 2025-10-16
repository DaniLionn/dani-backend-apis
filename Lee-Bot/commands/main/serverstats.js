const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getTimestamp } = require("discord-snowflake");
const { getAverageColor } = require("fast-average-color-node");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-stats")
    .setDescription("gets stats for the server!"),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = new EmbedBuilder();

    var members = interaction.guild.memberCount;

    getAverageColor(interaction.guild.iconURL()).then(async (color) => {
      embed
        .setTitle("Statistics for " + interaction.guild.name)
        .setColor(color.hex)
        .setThumbnail(interaction.guild.iconURL())
        .addFields(
          { name: "Member Count", value: members.toString() },
          {
            name: "Created",
            value:
              "<t:" +
              Math.floor(interaction.guild.createdAt.getTime() / 1000) +
              ":R>",
          },
        );

      await interaction.deleteReply();
      interaction.channel.send({ embeds: [embed] });
    });
  },
};
