const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("leewars")
    .setDescription("the hottest game of the year!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leederboards")
        .setDescription("who has the most loo kills"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("play").setDescription("play the game on roblox!"),
    ),
  async execute(interaction) {
    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "play") {
      interaction.reply(
        "Play Lee Wars 2007 on Roblox!\nhttps://bit.ly/LeeWars2007",
      );
      return;
    }

    if (subcommand === "leederboards") {
      const leederboard = JSON.parse(
        fs.readFileSync("/var/data/lee-wars-leaderboard.json", "utf8"),
      );

      let inventoryString = "Top Loo Kills:\n\n";

      const entries =
        leederboard && Object.keys(leederboard).length
          ? Object.entries(leederboard)
          : [];

      if (entries.length === 0) {
        inventoryString += "No leederboards yet!";
      } else {
        const top = entries
          .map(([user, kills]) => [user, Number(kills) || 0])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        for (const [user, kills] of top) {
          inventoryString += `- ${user}: ${kills.toLocaleString("en-US")}\n`;
        }
      }

      await interaction.reply(inventoryString);
      return;
    }
  },
};
