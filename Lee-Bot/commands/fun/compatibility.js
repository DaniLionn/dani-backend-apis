const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compatibility-tester")
    .setDescription('tests "compatibility" between two users')
    .addUserOption((option) =>
      option
        .setName("user1")
        .setDescription("The first user")
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName("user2")
        .setDescription("The second user")
        .setRequired(true),
    ),
  async execute(interaction) {

    function calculateCompatibility(u1,u2) {
      let id1, id2;

      if (u1 >= u2) {
        id1 = u1;
        id2 = u2;
      } else {
        id1 = u2;
        id2 = u1;
      }

      return Math.floor(
        (id1 / 1000000000000000 / (id2 / 1000000000000000)) * 100,
      );
    }

    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");

    const percent = calculateCompatibility(user1.id, user2.id)

    console.log(percent)

    await interaction.reply("Compatibility of " + user1.username +" and "+user2.username+":\n"+progressBar(percent,100,15));

  },
};
