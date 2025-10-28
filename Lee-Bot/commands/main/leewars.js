const { SlashCommandBuilder } = require("discord.js");

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
        "Play Lee Wars 2007 on Roblox!\nhttps://www.roblox.com/games/112463461428800/Lee-Wars-2007",
      );
      return;
    }

    if (subcommand === "leederboards") {
      const leederboard = JSON.parse(
        fs.readFileSync("/var/data/lee-wars-leaderboard.json", "utf8"),
      );

      let inventoryString = "Top Loo Kills:\n\n";

      if (!leederboard || Object.keys(leederboard).length === 0) {
        inventoryString += "No leederboards yet!";
      } else {
        for (const [user, kills] of Object.entries(leederboard)) {
          inventoryString += `- ${user}: ${kills.toLocaleString("en-US")}\n`;
        }
      }

      await interaction.reply(inventoryString);
      return;
    }
  },
};
