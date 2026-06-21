const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

const os = require("node:os")

function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backend-server-stats")
    .setDescription("current stats for the server lee runs on"),
  async execute(interaction) {
    const embed = new EmbedBuilder();
    const platform = os.platform()
    const freeMem = os.freemem()
    const totalMem = os.totalmem()
    const loadAverage = os.loadavg()
    const uptime = os.uptime()

    embed.setTitle("Backend Server Stats")
    embed.setThumbnail(await interaction.client.user.avatarURL());
    embed.addFields(
      { name: "Platform", value: platform },
      {
        name: "LoadAvg (1min, 5min, 15min)",
        value: loadAverage[0] + ", " + loadAverage[1] + ", " + loadAverage[2],
        inline: true
      },
      {name: "Uptime", value: new Date(uptime * 1000).toISOString().slice(11, 19)},
      {name: "Memory", value: humanFileSize(freeMem) + " / " + humanFileSize(totalMem)}

    );

  },
};
