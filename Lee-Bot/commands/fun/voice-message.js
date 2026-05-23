const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const wave =
  "acU6Va9UcSVZzsVw7IU/80s0Kh/pbrTcwmpR9da4mvQejIMykkgo9F2FfeCd235K/atHZtSAmxKeTUgKxAdNVO8PAoZq1cHNQXT/PHthL2sfPZGSdxNgLH0AuJwVeI7QZJ02ke40+HkUcBoDdqGDZeUvPqoIRbE23Kr+sexYYe4dVq+zyCe3ci/6zkMWbVBpCjq8D8ZZEFo/lmPJTkgjwqnqHuf6XT4mJyLNphQjvFH9aRqIZpPoQz1sGwAY2vssQ5mTy5J5muGo+n82b0xFROZwsJpumDsFi4Da/85uWS/YzjY5BdxGac8rgUqm9IKh7E6GHzOGOy0LQIz3O4ntTg==";

const axios = require("axios");
const { download } = require("../../scripts/utils");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("voice-message")
    .setDescription("upload an mp3 file as a voice message.")
    .addAttachmentOption((option) =>
      option.setName("audio-file").setDescription("mp3 or whatever idk").setRequired(true),
    ),
  async execute(interaction) {
    await interaction.deferReply();
   const filePath = await download(interaction.options.get("audio-file").attachment.url);

    let newPath = process.env.LEE_DATA_DIR + "/voice-message.ogg";


    const ffmpeg = spawn("ffmpeg", ["-i", filePath, newPath]);

    ffmpeg.on("close", async (code) => {
      if (code > 0) {
        interaction.editReply(
          "There was an error while running this command (Conversion process exited with code " +
            code +
            ")",
        );
        await fs.promises.unlink(filePath);
        return
      }

      await fs.promises.unlink(filePath);
      const ffprobe = spawn("ffprobe -v quiet -output_format json -show_format "+newPath);

      let dataa = ""

      ffprobe.on("message", (data) => {
        console.log(data)
        dataa+= data

      })





      ffprobe.on("close", async (code) => {

        if (code > 0) {
          interaction.editReply(
            "There was an error while running this command (Conversion process exited with code " +
              code +
              ")",
          );
          await fs.promises.unlink(newPath);
          return;
        }

        console.log(dataa);

        const attachmentResponse = await axios.post(
          `https://discord.com/api/v10/channels/${interaction.channel.id}/attachments`,
          {
            files: [
              {
                filename: "voice-message.ogg",
                file_size: fs.statSync(newPath).size,
                id: "2",
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bot " + process.env.LEE_TOKEN,
            },
          },
        );

        const upload_url = attachmentResponse.data.attachments[0].upload_url;
        const upload_filename =
          attachmentResponse.data.attachments[0].upload_filename;

        await axios.put(upload_url, await fs.promises.readFile(newPath), {
          headers: {
            "Content-Type": "application/ogg",
            Authorization: "Bot " + process.env.LEE_TOKEN,
          },
        });

        await axios.post(
          `https://discord.com/api/v10/channels/${interaction.channel.id}/messages`,
          {
            flags: 8192,
            attachments: [
              {
                id: "0",
                filename: "voice-message.ogg",
                uploaded_filename: upload_filename,
                duration_secs: Math.floor(
                  Number(JSON.parse(data).format.duration),
                ),
                waveform: wave,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bot " + process.env.LOO_TOKEN,
            },
          },
        );

        await fs.promises.unlink(newPath);
      });

      })





  },
};
