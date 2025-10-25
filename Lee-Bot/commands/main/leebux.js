const { readUserData } = require("../../scripts/utils");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("leebux")
    .setDescription("commands relating to lee's currency, leebux")
    .addSubcommand((subcommand) =>
      subcommand.setName("balance").setDescription("leebux balance"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("daily").setDescription("daily leebux"),
    ),
  async execute(interaction) {
    const data = readUserData();

    function registerUser(id, username) {
      data[id] = {
        username: username,
        leebux: 0,
        last_daily: 0,
      };
    }

    const userData =
      data[interaction.user.id] ||
      registerUser(interaction.user.id, interaction.user.username);

    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "balance") {
      interaction.reply(
        interaction.user.username +
          "'s balance: " +
          userData.leebux +
          ":leebux:",
      );
    }
  },
};
