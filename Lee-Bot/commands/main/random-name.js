const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-name")
    .setDescription(
      "generates a random name. can be used for character names.",
    ),
  async execute(interaction) {
    await interaction.deferReply();

    async function obtainName() {
      await axios
        .get("https://randomuser.me/api/", {
          headers: {
            Accept: "application/json",
          },
        })
        .then(async (response) => {
          const nameData = response.data;

          await interaction.editReply(
            `${nameData.results.name.first} ${nameData.results.name.last}`,
          );
        });
    }
    obtainName();
  },
};
