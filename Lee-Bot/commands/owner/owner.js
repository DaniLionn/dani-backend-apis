const { spawn } = require("child_process");
const {once} = require("node:events");
const { SlashCommandBuilder } = require("discord.js");
const { download } = require("../../scripts/utils");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("owner")
    .setDescription("commands that only lee's creator can use")
    .addSubcommand((subcommand) =>
      subcommand.setName("run-command").setDescription("Run a command through leebot")    .addStringOption((option) =>
          option
              .setName("command")
              .setDescription("The command to run")
              .setRequired(true),
      ),
    // )    .addSubcommand((subcommand) =>
    //   subcommand.setName("userdata-dump").setDescription("sends userdata"),
    // ).addSubcommand((subcommand) =>
    //   subcommand.setName("userdata-upload").setDescription("sends userdata").addAttachmentOption("userdata"),
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

    if (subcommand === "run-command") {
     await interaction.deferReply()

      try {

        const run = spawn(interaction.options.getString("command"))

        run.on("error", function (error) {
          run.emit("exit", 1);
          interaction.editReply(error.message)
        })

        let output = ""

        run.stdout.on("data", (stdout) => {
          output += stdout;
        })

        run.stderr.on("data", (stderr) => {
          output += stderr;
        })

        await run.once("exit", async (code) => {
          if (code !== 0) {return}

          await interaction.editReply(output);
        })



      } catch (err) {await interaction.editReply(err)}





    }

  },
};
