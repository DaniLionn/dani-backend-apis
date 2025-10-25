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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cf")
        .setDescription("coin flip")
        .addNumberOption((option) =>
          option
            .setName("amount")
            .setDescription("how much you want to bet")
            .setRequired(true),
        ),
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

    console.log(userData);

    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "balance") {
      interaction.reply(
        interaction.user.username +
          "'s balance: " +
          Math.floor(userData.leebux) +
          " <:leebux:1431469715586416771>",
      );
      return;
    }
    if (subcommand === "daily") {
      const now = new Date().getTime() / 1000;
      console.log(now, userData.daily_reset);
      if (now >= userData.daily_reset) {
        userData.daily_reset = now + 86400;
        userData.leebux += 300;
        console.log(userData);
        writeUserData(userData, interaction.user.id);
        await interaction.reply(
          "Daily 300 <:leebux:1431469715586416771> obtained!",
        );
      } else {
        const diff = userData.daily_reset - now;
        console.log(diff);
        await interaction.reply(
          "You've already redeemed your daily LeeBux! You have " +
            new Date(userData.daily_reset * 1000)
              .toISOString()
              .substring(11, 16) +
            " remaining until you can redeem again.",
        );
      }
      return;
    }

    if (subcommand === "cf") {
      const amount = interaction.options.getNumber("amount");

      if (userData.leebux < amount) {
        await interaction.reply(
          "you don't have enough leebux<:leebux:1431469715586416771>  idiot",
        );
        return;
      }

      const random = Math.random();

      const win = random >= 0.5;

      if (win === true) {
        await interaction.reply(
          "You bet " +
            amount +
            "<:leebux:1431469715586416771>  and flip a coin...",
        );
        setTimeout(async () => {
          await interaction.editReply(
            "You bet " +
              amount +
              "<:leebux:1431469715586416771> and flip a coin...\nAnd it lands on heads! You've won " +
              amount * 2 +
              "<:leebux:1431469715586416771>!",
          );
          userData.leebux = userData.leebux + amount * 2;
          writeUserData(userData, interaction.user.id);
        }, 1500);
      } else {
        await interaction.reply(
          "You bet " +
            amount +
            "<:leebux:1431469715586416771> and flip a coin...",
        );
        setTimeout(async () => {
          await interaction.editReply(
            "You bet " +
              amount +
              "<:leebux:1431469715586416771>  and flip a coin...\nAnd it lands on tails... You've lost " +
              amount +
              "<:leebux:1431469715586416771>...",
          );
          userData.leebux = userData.leebux - amount;
          writeUserData(userData, interaction.user.id);
        }, 1500);
      }
    }
  },
};
