const { SlashCommandBuilder } = require("discord.js");
const flipnote = require("flipnote.js");
const { download } = require("../../scripts/utils.js");
const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("flipnote-to-mp4")
    .setDescription("Converts Flipnote Studio .ppm files to mp4 video files.")
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("The file you want to convert")
        .setRequired(true),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    function random() {
      return Math.floor(Math.random() * 10000);
    }

    const workingDir = path.join(
      process.env.LEE_DATA_DIR,
      "conversion" + random(),
    );

    await fs.mkdir(workingDir);

    const ppm = interaction.options.getAttachment("file");

    await download(ppm.url, workingDir).then(async (downloadedPPM) => {
      if (path.extname(downloadedPPM) != ".ppm") {
        await fs.unlink(downloadedPPM);
        await fs.rmdir(workingDir);
        await interaction.editReply(
          "The attached file has the wrong extension!",
        );
        return;
      }

      const file = await fs.readFile(downloadedPPM);
      const note = await flipnote.parse(file);

      const gifBuffer = flipnote.GifImage.fromFlipnote(note).getBuffer();
      await fs.writeFile(
        path.join(workingDir, note.meta.current.filename + ".gif"),
        gifBuffer,
      );

      const wav = flipnote.WavAudio.fromFlipnote(note);
      const wavBuffer = wav.getBuffer();
      await fs.writeFile(
        path.join(workingDir, note.meta.current.filename + ".wav"),
        wavBuffer,
      );

      const ffmpeg = spawn("ffmpeg", [
        "-i",
        path.join(workingDir, note.meta.current.filename + ".gif"),
        "-i",
        path.join(workingDir, note.meta.current.filename + ".wav"),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-shortest",
        path.join(workingDir, note.meta.current.filename + ".mp4"),
      ]);

      ffmpeg.on("close", async (code) => {
        console.log(`ffmpeg process exited with code ${code}`);
        if (code == 0) {
          await interaction.editReply({
            files: [path.join(workingDir, note.meta.current.filename + ".mp4")],
          });
        } else {
          await interaction.editReply(
            "Something went wrong when converting your Flipnote.",
          );
        }

        await fs.unlink(
          path.join(workingDir, note.meta.current.filename + ".gif"),
        );
        await fs.unlink(
          path.join(workingDir, note.meta.current.filename + ".mp4"),
        );
        await fs.unlink(
          path.join(workingDir, note.meta.current.filename + ".wav"),
        );

        await fs.unlink(downloadedPPM);
        await fs.rmdir(workingDir);
      });
    });
  },
};
