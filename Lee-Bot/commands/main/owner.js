const { spawn } = require("child_process");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("owner")
    .setDescription("commands that only lee's creator can use")
    .addSubcommand((subcommand) =>
      subcommand.setName("storage").setDescription("disk usage of /var/data"),
    ),
  async execute(interaction) {
    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "storage") {
      await interaction.deferReply();
      const diskUsage = spawn("df", [
        "--output=pcent",
        "/var/data",
        "|",
        "tail",
        "-n",
        "1",
        "|",
        "tr",
        "-d",
        "' %'",
      ]);

      diskUsage.stdout.on("data", async (data) => {
        await interaction.editReply(data);
      });

      return;
    }
  },
};
