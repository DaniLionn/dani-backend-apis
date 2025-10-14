const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-name")
    .setDescription(
      "generates a random name. can be used for character names.",
    ),
  async execute(interaction) {
    if (!interaction.deferred) {
      console.log("[random-name.js:11] Deferring reply...");
      await interaction.deferReply();
    }
    console.log("[random-name.js:14] Fetching random name...");
    await axios
      .get("https://randomuser.me/api/", {
        headers: {
          Accept: "application/json",
        },
      })
      .then(async (response) => {
        console.log("[random-name.js:22] Response received.");
        const nameData = response.data;
        // console.log(
        //   nameData.results[0].name,
        //   `${nameData.results[0].name.first} ${nameData[0].results.name.last}`,
        // );
        await interaction.editReply(
          `${nameData.results[0].name.first} ${nameData[0].results.name.last}`,
        );
      });
  },
};
