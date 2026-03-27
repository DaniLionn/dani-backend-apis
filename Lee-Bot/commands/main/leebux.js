const { readUserData, writeUserData } = require("../../scripts/utils");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} = require("discord.js");
const cards = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
module.exports = {
  data: new SlashCommandBuilder()
    .setName("leebux")
    .setDescription("commands relating to lee's currency, leebux")
    .addSubcommand((subcommand) =>
      subcommand.setName("balance").setDescription("leebux balance"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("inventory").setDescription("leebux inventory"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("daily").setDescription("daily leebux"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("shop").setDescription("buy goods"),
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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("weird-coin-flip")
        .setDescription("coin flip but weird")
        .addNumberOption((option) =>
          option
            .setName("amount")
            .setDescription("how much you want to bet")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("high-low")
        .setDescription("high low game")
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
        inventory: {},
      };
      writeUserData(data[id], id);
      return data[id];
    }

    const convertSeconds = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds =
        (seconds % 1 > 0 && Math.floor(seconds % 60)) || seconds % 60;

      const hourString =
        hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
      const minuteString =
        minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "";
      const secondString =
        remainingSeconds > 0
          ? `${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`
          : "";

      if (hours > 0) {
        return `${hourString} : ${minuteString || "0 "} ${secondString && ` : ${secondString}`}`;
      } else if (!hours && minutes > 0) {
        return `${minuteString} ${secondString && ` : ${secondString}`}`;
      }

      return secondString;
    };

    var userData =
      data[interaction.user.id] ||
      registerUser(interaction.user.id, interaction.user.username);

    if (userData.inventory === undefined) {
      userData.inventory = {};
    }

    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "balance") {
      interaction.reply(
        interaction.user.username +
          "'s balance: " +
          Math.floor(userData.leebux).toLocaleString("en-US") +
          " <:leebux:1431469715586416771>",
      );
      return;
    }

    if (subcommand === "shop") {
      const yes1 = new ButtonBuilder()
        .setCustomId("yes1")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Primary);

      const yes2 = new ButtonBuilder()
        .setCustomId("yes2")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(yes1, yes2);

      await interaction.reply({
        content:
          "Currently, the only item in the shop is a plushie. Of me!!! Would you like to buy one for 1,000<:leebux:1431469715586416771>?",
        components: [row],
      });

      const filter = (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
        max: 1,
      });

      async function buyPlushie() {
        userData.leebux = userData.leebux - 1000;
        userData.inventory["lee_plush"] =
          (userData.inventory["lee_plush"] || 0) + 1;

        if (userData.leebux < 1000) {
          await interaction.editReply({
            content:
              "Thank you! You are now in debt. (+1 <:lee_plush:1431871543914266725> added to inventory!)",
            components: [],
          });
          return;
        } else {
          writeUserData(userData, interaction.user.id);
          await interaction.editReply({
            content:
              "Thank you! (+1 <:lee_plush:1431871543914266725> added to inventory!)",
            components: [],
          });
        }
      }

      collector.on("collect", async (i) => {
        if (i.customId === "yes1") {
          await buyPlushie();
        }
        if (i.customId === "yes2") {
          await buyPlushie();
        }
      });
    }

    if (subcommand === "inventory") {
      const icons = {
        lee_plush: "<:lee_plush:1431871543914266725>",
      };

      let inventoryString = "Your Inventory:\n";

      if (!userData.inventory || Object.keys(userData.inventory).length === 0) {
        inventoryString += "Your inventory is empty.";
      } else {
        for (const [item, quantity] of Object.entries(userData.inventory)) {
          inventoryString += `- ${icons[item] || item}: ${quantity.toLocaleString("en-US")}\n`;
        }
      }

      await interaction.reply(inventoryString);
      return;
    }

    if (subcommand === "daily") {
      const now = Math.floor(new Date().getTime() / 1000);
      console.log(now, userData.daily_reset);
      if (now >= userData.daily_reset) {
        userData.daily_reset = now + 86400;
        userData.leebux += 300 + userData.inventory["lee_plush"] || 0 * 5;
        console.log(userData);
        writeUserData(userData, interaction.user.id);
        await interaction.reply(
          "Daily " +
            (300 + userData.inventory["lee_plush"] || 0 * 5).toLocaleString(
              "en-US",
            ) +
            " <:leebux:1431469715586416771> obtained!",
        );
      } else {
        const diff = userData.daily_reset - now;
        console.log(diff);
        await interaction.reply(
          "You've already redeemed your daily LeeBux! You have " +
            convertSeconds(diff) +
            " remaining until you can redeem again.",
        );
      }
      return;
    }

    if (subcommand === "cf") {
      const amount = interaction.options.getNumber("amount");

      if (userData.leebux < amount) {
        await interaction.reply(
          "you don't have enough leebux<:leebux:1431469715586416771>  :rofl:",
        );
        return;
      }

      const random = Math.random();

      const win = random >= 0.5;

      if (win === true) {
        await interaction.reply(
          "You bet " +
            amount.toLocaleString("en-US") +
            "<:leebux:1431469715586416771>  and flip a coin...",
        );
        setTimeout(async () => {
          await interaction.editReply(
            "You bet " +
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771> and flip a coin...\nAnd it lands on heads! You've won " +
              (amount * 2).toLocaleString("en-US") +
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
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771>  and flip a coin...\nAnd it lands on tails... You've lost " +
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771>...",
          );
          userData.leebux = userData.leebux - amount;
          writeUserData(userData, interaction.user.id);
        }, 1500);
      }
    }

    if (subcommand === "weird-coin-flip") {
      const amount = interaction.options.getNumber("amount");

      if (userData.leebux < amount) {
        await interaction.reply(
          "you don't have enough leebux<:leebux:1431469715586416771> :rofl:",
        );
        return;
      }

      const random = Math.random();

      const win = random >= 0.25;

      if (win === true) {
        await interaction.reply(
          "You bet " +
            amount.toLocaleString("en-US") +
            "<:leebux:1431469715586416771>  and flip a weirdly weighted coin...",
        );
        setTimeout(async () => {
          await interaction.editReply(
            "You bet " +
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771> and flip a weirdly weighted coin...\nAnd it lands on heads! You've won " +
              Math.floor(amount * 1.5).toLocaleString("en-US") +
              "<:leebux:1431469715586416771>!",
          );
          userData.leebux = userData.leebux + Math.floor(amount * 1.5);
          writeUserData(userData, interaction.user.id);
        }, 1500);
      } else {
        await interaction.reply(
          "You bet " +
            amount.toLocaleString("en-US") +
            "<:leebux:1431469715586416771> and flip a flip a weirdly weighted coin...",
        );
        setTimeout(async () => {
          await interaction.editReply(
            "You bet " +
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771>  and flip a flip a weirdly weighted coin...\nAnd it lands on tails... Unlucky! You've lost " +
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771>...",
          );
          userData.leebux = userData.leebux - amount;
          writeUserData(userData, interaction.user.id);
        }, 1500);
      }
    }

    if (subcommand === "high-low") {
      const amount = interaction.options.getNumber("amount");

      const higher = new ButtonBuilder()
        .setCustomId("higher")
        .setLabel("Higher")
        .setStyle(ButtonStyle.Primary);

      const lower = new ButtonBuilder()
        .setCustomId("lower")
        .setLabel("Lower")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(lower, higher);

      if (userData.leebux < amount) {
        await interaction.reply(
          "you don't have enough leebux<:leebux:1431469715586416771> :rofl:",
        );
        return;
      }

      const card1 = cards[Math.floor(Math.random() * cards.length)];
      var card2 = cards[Math.floor(Math.random() * cards.length)];

      if (card1 === card2) {
        while (card1 === card2) {
          card2 = cards[Math.floor(Math.random() * cards.length)];
        }
      }
      const cardValue1 = cards.indexOf(card1) + 1;
      const cardValue2 = cards.indexOf(card2) + 1;

      await interaction.reply({
        content:
          "You bet " +
          amount.toLocaleString("en-US") +
          "<:leebux:1431469715586416771>  on a high-low card game!\nThe number on the first card is\n" +
          card1 +
          "\nWill the next card be higher or lower?",
        components: [row],
      });

      const filter = (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
        max: 1,
      });

      collector.on("collect", async (i) => {
        console.log(`Collected ${i.customId}`);

        let userChoice = i.customId; // "higher" or "lower"

        let result;
        if (cardValue2 > cardValue1) {
          result = "higher";
        } else if (cardValue2 < cardValue1) {
          result = "lower";
        } else {
          result = "equal";
        }

        if (result === "equal") {
          await interaction.editReply({
            content:
              "The number on the next card is... \n# " +
              card2 +
              "!\nIt's a tie! You neither win nor lose any leebux.",
            components: [],
          });
        } else if (userChoice === result) {
          await interaction.editReply({
            content:
              "The number on the next card is... \n# " +
              card2 +
              "!\nYou guessed correctly! You've won " +
              (amount * 2).toLocaleString("en-US") +
              "<:leebux:1431469715586416771>!",
            components: [],
          });
          userData.leebux = userData.leebux + amount * 2;
          writeUserData(userData, interaction.user.id);
        } else {
          await interaction.editReply({
            content:
              "The number on the next card is... \n# " +
              card2 +
              "...\nUnlucky, you guessed wrong! You've lost " +
              amount.toLocaleString("en-US") +
              "<:leebux:1431469715586416771>!",
            components: [],
          });
          userData.leebux = userData.leebux - amount;
          writeUserData(userData, interaction.user.id);
        }
      });
    }
  },
};
