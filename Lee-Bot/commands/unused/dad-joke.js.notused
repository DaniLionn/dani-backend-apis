const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dad-joke")
    .setDescription("tells a hilarious dad joke that's sure to make you groan"),
  async execute(interaction) {
    await interaction.deferReply();

    async function obtainJoke() {
      await axios
        .get("https://icanhazdadjoke.com/", {
          headers: {
            Accept: "application/json",
          },
        })
        .then(async (response) => {
          const jokeData = response.data;

          await interaction.editReply(`${jokeData.joke}`);
        });
    }
    obtainJoke();
  },
};
