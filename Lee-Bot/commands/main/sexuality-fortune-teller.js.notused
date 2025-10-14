const { SlashCommandBuilder } = require("discord.js");

const results = {
  0: "your a lesbi",
  1: "you smell fruity i think you're gay",
  2: "you seem like you're bi",
  3: "you're pan.",
  4: "you might be asexual and/or aromantic",
  5: "you're abrosexual",
  6: "you're something else that wasn't programmed here lol",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sexuality-fortune-teller")
    .setDescription("idk it was mal's idea"),
  async execute(interaction) {
    const resultNum = Number(BigInt(interaction.user.id) % 7n);
    await interaction.reply("# ok... i can see it.. YEEEEeeeeeee!!");
    setTimeout(async function () {
      await interaction.editReply(
        "# ok... i can see it.. YEEEEeeeeeee!!\n\n## i think... ",
      );
      setTimeout(async function () {
        await interaction.editReply(
          "# ok... i can see it.. YEEEEeeeeeee!!\n\n## i think... " +
            results[resultNum],
        );
        setTimeout(async function () {
          await interaction.editReply(
            "# ok... i can see it.. YEEEEeeeeeee!!\n\n## i think... " +
              results[resultNum] +
              "\n\nwas i right?",
          );
        }, 500);
      }, 1000);
    }, 1000);
  },
};
