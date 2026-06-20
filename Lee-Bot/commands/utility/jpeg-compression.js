const { SlashCommandBuilder } = require("discord.js");
const { download } = require("../../utils/scripts/utils");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs").promises;

const customEmojis = require(`../../scripts/lee-emojis`);
module.exports = {
  data: new SlashCommandBuilder()
    .setName("jpeg-compression")
    .setDescription("lol")
    .addAttachmentOption((option) =>
      option.setName("jpg").setDescription("la crunch").setRequired(true),
    ),
  async execute(interaction) {



    async function convert(jpegpath) {
      //console.log(jpegpath);
      const crunchification = spawn(
        path.join(process.env.LEE_ROOT_DIR, "/bin/jpegoptim"),
        ["--size=1k", jpegpath, "--overwrite"],
      );

      //crunchification.on("error", (msg) => console.log(msg));

      crunchification.on("close", async (code) => {
        if (code > 0) {
          interaction.editReply(
            "There was an error while running this command (Compression process exited with code " +
              code +
              ")",
          );
          return;
        }
        //console.log(jpegpath);
        await interaction.editReply({ content: "", files: [jpegpath] });
        await fs.unlink(jpegpath);
      });
    }

    const image = interaction.options.get("jpg");
    await interaction.reply(`${customEmojis.loading} Converting... `);
    await download(image.attachment.url, "./temp").then((imgpath) => {
      /*console.log(
        "image:",
        imgpath,
        path.basename(imgpath) + ".jpg",
        image.attachment.contentType,
      );*/
      if (path.extname(imgpath) !== ".jpg") {
        const ffmpeg = spawn("ffmpeg", [
          "-i",
          imgpath,
          path.basename(imgpath) + ".jpg",
        ]);

        ffmpeg.on("close", async (code) => {
          if (code > 0) {
            interaction.editReply(
              "There was an error while running this command (Conversion process exited with code " +
                code +
                ")",
            );
            return;
          }
          imgpath = path.basename(imgpath) + ".jpg";
         await convert(imgpath);

        });
      } else {
        convert(imgpath);
      }
    });
  },
};
