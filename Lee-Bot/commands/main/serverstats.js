const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const { getAverageColor } = require("fast-average-color-node");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-stats")
    .setDescription("gets stats for the server!"),
  async execute(interaction) {
    const embed = new EmbedBuilder();

    const channels = interaction.guild.channels.cache;

    const members = await interaction.guild.members.fetch();
    const bots = members.filter((m) => m.user.bot).size;
    const humans = members.size - bots;

    const iconUrl = interaction.guild.iconURL();
    const defaultColor = "#5865F2"; // Discord blurple fallback

    // Safely get average color if an icon exists, otherwise use default
    const colorHex = await (async () => {
      if (!iconUrl) return defaultColor;
      try {
        const c = await getAverageColor(iconUrl);
        return c && c.hex ? c.hex : defaultColor;
      } catch {
        return defaultColor;
      }
    })();

    embed
      .setTitle("Statistics for " + interaction.guild.name)
      .setColor(colorHex)
      .setThumbnail(iconUrl || undefined)
      .addFields(
        { name: "Total Members", value: members.size.toString() },
        { name: "Bot Members", value: bots.toString(), inline: true },
        { name: "Human Members", value: humans.toString(), inline: true },
        {
          name: "Total Channels",
          value: channels.size.toString(),
        },
        {
          name: "Text Channels",
          value: channels
            .filter((c) => c.type === ChannelType.GuildText)
            .size.toString(),
          inline: true,
        },
        {
          name: "Voice Channels",
          value: channels
            .filter((c) => c.type === ChannelType.GuildVoice)
            .size.toString(),
          inline: true,
        },
        {
          name: "Server Owner",
          value: await interaction.guild.members.fetch(
            interaction.guild.ownerId,
          ),
        },
        {
          name: "Created",
          value:
            "<t:" +
            Math.floor(interaction.guild.createdAt.getTime() / 1000) +
            ":R>",
        },
      );

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      // If reply fails (e.g. already replied), attempt followUp
      try {
        await interaction.followUp({ embeds: [embed] });
      } catch {
        // swallow to avoid unhandled rejection
      }
    }
  },
};
