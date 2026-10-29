const { SlashCommandBuilder } = require("discord.js");
const { YtDlp } = require('ytdlp-nodejs');


const ytdlp = new YtDlp();
module.exports = {
  data: new SlashCommandBuilder().setName("video-downloader").setDescription("download videos with ytdlp")        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription(
              'The URL for the video you want to download.',
            )
            .setRequired(true),
        ),
  async execute(interaction) {

    const link = interaction.options.getString("url")

    await interaction.reply("Hang on...")
    const updateResult = await ytdlp.updateYtDlpAsync();
    console.log(`Updated to ${updateResult.version}`);
   await interaction.deleteReply()
   await interaction.channel.send("Downloading video...")
    const video = await ytdlp
    .download(link)
    .run();

   await interaction.channel.send({
      content: "Here's your video!!\n-# ``URL: " + link+"``",
      files: video.filePaths
    })
  },
};
