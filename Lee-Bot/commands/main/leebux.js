const { readUserData, writeUserData } = require("../../scripts/utils");
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
    var data = readUserData();

    function registerUser(id, username) {
      data[id] = {
        username: username,
        leebux: 0,
        daily_reset: 0,
      };
      writeUserData(data[id], id);
      return data[id];
    }

    var userData =
      data[interaction.user.id] ||
      registerUser(interaction.user.id, interaction.user.username);

    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "balance") {
      interaction.reply(
        interaction.user.username +
          "'s balance: " +
          userData.leebux +
          " :leebux:",
      );
      return;
    }
    if (subcommand === "daily") {
      const now = new Date().getTime() / 1000;
      if (now >= userData.daily_reset) {
        userData.daily_reset = now + 86400;
        userData.leebux += 300;
        console.log(userData);
        writeUserData(userData, id);
        await interaction.reply("Daily 300 :leebux: obtained!");
      } else {
        const diff = userData.daily_reset - now;
        await interaction.reply(
          "You've already redeemed your daily LeeBux! You have " +
            new Date(diff * 1000).toISOString().substring(11, 16) +
            " remaining until you can redeem again.",
        );
      }
    }
  },
};
