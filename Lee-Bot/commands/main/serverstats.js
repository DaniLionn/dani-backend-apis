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
    const textchannels = channels.filter(
      (c) => c.type === ChannelType.GuildText,
    );
    const voicechannels = channels.filter(
      (c) => c.type === ChannelType.GuildVoice,
    );

    const members = await interaction.guild.members.fetch();
    const bots = members.filter((m) => m.user.bot).size;
    const humans = members.size - bots;

    const serverOwner = await interaction.guild.members.cache.get(
      interaction.guild.ownerId,
    );
    console.log(serverOwner);

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
        { name: "Total Members", value: members.size.toString(), inline: true },
        { name: "Bot Members", value: bots.toString(), inline: true },
        { name: "Human Members", value: humans.toString(), inline: true },
        { name: "\u200B", value: "\u200B" },
        {
          name: "Total Channels",
          value: channels.size.toString(),
          inline: true,
        },
        {
          name: "Text Channels",
          value: textchannels.size.toString(),
          inline: true,
        },
        {
          name: "Voice Channels",
          value: voicechannels.size.toString(),
          inline: true,
        },
        { name: "\u200B", value: "\u200B" },
        {
          name: "Server Owner",
          value: serverOwner.displayName + " (" + serverOwner.name + ")",
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
