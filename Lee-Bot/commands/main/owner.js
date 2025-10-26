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
    if (interaction.user.id !== process.env.OWNER_ID) {
      await interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true,
      });
      return;
    }

    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "storage") {
      await interaction.deferReply();
      const diskUsage = spawn("sh", [
        "-c",
        "df --output=pcent /var/data | tail -n 1 | tr -d ' %'",
      ]);

      // ensure stdout emits strings (so the existing stdout 'data' handler will get a string)
      diskUsage.stdout.setEncoding("utf8");

      diskUsage.on("error", async (err) => {
        await interaction.editReply(`Failed to run disk check: ${err.message}`);
      });

      // diskUsage.on("close", (code) => {
      //   if (code !== 0) {
      //     interaction.editReply(`df exited with code ${code}`);
      //   }
      // });

      diskUsage.stdout.on("data", async (data) => {
        await interaction.editReply(
          "Data partition is " + data.trim() + "% full",
        );
      });

      return;
    }
  },
};
