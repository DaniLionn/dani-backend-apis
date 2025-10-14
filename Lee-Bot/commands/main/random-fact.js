const { SlashCommandBuilder } = require("discord.js");

const { default: axios } = require("axios");

var limit = 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-fact")
    .setDescription("gives you a random fact"),
  async execute(interaction) {
    await interaction.deferReply();
    await axios
      .get("https://api.api-ninjas.com/v1/facts", {
        headers: {
          "X-Api-Key": process.env.FACTS_API_KEY,
        },
      })
      .then((response) => {
        interaction.editReply(response.data[0]["fact"]);
      });
  },
};
