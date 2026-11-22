const { SlashCommandBuilder } = require("discord.js");
const { download } = require("../../utils/scripts/utils");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs").promises;
const customEmojis = require(`../../utils/references/lee-emojis`);
module.exports = {
  data: new SlashCommandBuilder()
    .setName("low-quality-mp3")
    .setDescription("absolutely ruins an mp3")
    .addAttachmentOption((option) =>
      option
        .setName("mp3")
        .setDescription("ruin it. ruin it good.")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("extra-info")
        .setDescription(
          "tells you how much the filesize changed after the conversion",
        ),
    ),
  async execute(interaction) {
    await interaction.reply(`${customEmojis.loading} Converting... `);

    const mp3Attachment = interaction.options.getAttachment("mp3");
    const showExtraInfo = interaction.options.getBoolean("extra-info");

    const downloadedMP3 = await download(mp3Attachment.url);

    const originalSize = (await fs.stat(downloadedMP3)).size;

    const outputPath = path.join(__dirname, mp3Attachment.name);

    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      downloadedMP3,
      "-y",
      "-b:a",
      "8k",
      "-ar",
      "8000",
      "-ac",
      "1",
      outputPath,
    ]);

    // ffmpegProcess.stderr.on("data", (data) => {
    //   console.error(`${data}`);
    // });

    ffmpegProcess.on("close", async (code) => {
      if (code === 0) {
        const modifiedSize = (await fs.stat(outputPath)).size;
        const percentReduction = Math.round(
          ((originalSize - modifiedSize) / originalSize) * 100,
        );

        if (showExtraInfo === true) {
          await interaction.editReply({
            content:
              "btw your file was reduced by " + percentReduction + "% lolers",
            files: [outputPath],
          });
        } else {
          await interaction.editReply({ content: "", files: [outputPath] });
        }
      } else {
        await interaction.editReply(
          "Something went wrong while converting your file!",
        );
      }

      await fs.unlink(downloadedMP3);
      await fs.unlink(outputPath);
    });
  },
};
