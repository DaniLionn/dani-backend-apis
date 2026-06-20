const { SlashCommandBuilder } = require("discord.js");
const { download } = require("../../utils/scripts/utils");
const fs = require("node:fs");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoji-kitchen")
    .setDescription("create wacky emoji combos using google's emoji kitchen")
    .addStringOption((option) =>
      option
        .setName("emoji1")
        .setDescription("The first emoji")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("emoji2")
        .setDescription("The second emoji")
        .setRequired(true),
    ),
  async execute(interaction) {
    const emoji1 = interaction.options.getString("emoji1");
    const emoji2 = interaction.options.getString("emoji2");
    download(
      `https://emk.now.sh/s/${emoji1}_${emoji2}?size=256`,
      "./temp",
      "emojiMix.png",
    ).then(async (filePath) => {
      await interaction.reply({
        content: `## ${emoji1}  ➕  ${emoji2}`,
        files: [filePath],
      });
      await fs.promises.unlink(filePath);
    });
  },
};
