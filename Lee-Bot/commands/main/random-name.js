const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-name")
    .setDescription(
      "generates a random name. can be used for character names.",
    ),
  async execute(interaction) {
    //console.log("[random-name.js:10] Deferring reply...");
    await interaction.deferReply();
    //console.log("[random-name.js:12] Fetching random name...");
    await axios
      .get(
        `https://api.parser.name/?api_key=${process.env.NAME_API_KEY}&endpoint=generate`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      )
      .then(async (response) => {
        //console.log("[random-name.js:23] Response received.");
        const nameData = response.data;
        await interaction.editReply(
          `${nameData.data[0].name.firstname.name} ${nameData.data[0].name.lastname.name}\n-# please don't use this command too much i only get 250 api calls per day`,
        );
      });
  },
};
