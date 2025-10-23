const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
//const { getTimestamp } = require("discord-snowflake");
const { getAverageColor } = require("fast-average-color-node");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-stats")
    .setDescription("gets stats for the server!"),
  async execute(interaction) {
    //await interaction.deferReply();
    const embed = new EmbedBuilder();

    const members = await interaction.guild.members.fetch();
    const bots = members.filter((m) => m.user.bot).size;
    const humans = members.size - bots;

    getAverageColor(interaction.guild.iconURL()).then(async (color) => {
      embed
        .setTitle("Statistics for " + interaction.guild.name)
        .setColor(color.hex)
        .setThumbnail(interaction.guild.iconURL())
        .addFields(
          { name: "Total Members", value: members.length.toString() },
          { name: "Bot Members", value: bots.toString(), inline: true },
          { name: "Human Members", value: humans.toString(), inline: true },
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
