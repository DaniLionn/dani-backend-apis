const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("splashcat-upload").setDescription("Manually upload Splatoon 3 data to Splashcat"),
  async execute(interaction) {
    await interaction.deferRely()
    if (interaction.user.id != "599641108116406300") {
        await interaction.reply("You can't use this command!");
    }

      await interaction.editReply("Uploading splat3 data to splashcat")
  const process = spawn('deno', ['run', '-Ar', ' https://raw.githubusercontent.com/spacemeowx2/s3si.ts/main/s3si.ts', '-e', 'splashcat', '-p', '/var/data/s3siprofile.json']);

process.on('error', async (error) => {
  await interaction.editReply(`Failed to start process: ${error.message}`);
});


process.on('close', async (code) => {
    if (code == 0)  {
        await interaction.editReply("Done! Check data here: https://splashcat.ink/@lotus_lass/battles/")
    }
  console.log(`Child process exited with code ${code}`);
});


  },
};
