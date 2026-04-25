const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const voiceFiles = [
  {
    path:
      process.env.ROOT_DIR +
      "/Loo-Bot/assets/voice-messages/loo_peepeepoopoo.ogg",
    duration: 1.5,
  },
];
const wave =
  "acU6Va9UcSVZzsVw7IU/80s0Kh/pbrTcwmpR9da4mvQejIMykkgo9F2FfeCd235K/atHZtSAmxKeTUgKxAdNVO8PAoZq1cHNQXT/PHthL2sfPZGSdxNgLH0AuJwVeI7QZJ02ke40+HkUcBoDdqGDZeUvPqoIRbE23Kr+sexYYe4dVq+zyCe3ci/6zkMWbVBpCjq8D8ZZEFo/lmPJTkgjwqnqHuf6XT4mJyLNphQjvFH9aRqIZpPoQz1sGwAY2vssQ5mTy5J5muGo+n82b0xFROZwsJpumDsFi4Da/85uWS/YzjY5BdxGac8rgUqm9IKh7E6GHzOGOy0LQIz3O4ntTg==";

const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("speak")
    .setDescription("loo will say something"),
  async execute(interaction) {
    await interaction.reply({
      content: "Choosing a voice message.",
      ephemeral: true,
    });
    const randomFile =
      voiceFiles[Math.floor(Math.random() * voiceFiles.length)];

    const newPath = process.env.LEE_DATA_DIR + "/voice-message.ogg";

    await fs.promises.copyFile(randomFile.path, newPath);

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
          Authorization: "Bot " + process.env.LOO_TOKEN,
        },
      },
    );

    const upload_url = attachmentResponse.data.attachments[0].upload_url;
    const upload_filename =
      attachmentResponse.data.attachments[0].upload_filename;

    await axios.put(upload_url, await fs.promises.readFile(newPath), {
      headers: {
        "Content-Type": "application/ogg",
        Authorization: "Bot " + process.env.LOO_TOKEN,
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
            duration_secs: randomFile.duration,
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
  },
};
