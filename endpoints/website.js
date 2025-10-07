const axios = require("axios");
const { Webhook } = require("discord-webhook-node");
const websiteHook = new Webhook(process.env.WEBHOOK_URL);
const { getAverageColor } = require("fast-average-color-node");

module.exports = {
  "get/website/message": async function (req, res) {
    const sender = req.query.name;

    const message = req.query.message;

    await websiteHook.send(`${sender} says: "${message}"`);

    res.redirect("https://danilionn.github.io/about-me-info-site/");
  },

  "get/website/steamgames": async function (req, res) {
    var html = `<!DOCTYPE html><html><head><style>
  @font-face {
  font-family: Nunito;
  src: url(https://danilionn.github.io/about-me-info-site/assets/fonts/Nunito-Regular.woff2);
}

div {
  font-family: Nunito;
}
  
  </style><script>
function redir(id) {
 window.top.location.href = "https://store.steampowered.com/app/"+id;
}
    function brightenImage(image) {
      image.style.filter = "brightness(1.15)";
    }

    function resetImage(image) {
      image.style.filter = "brightness(1)";
    }
</script>
</head>
<body style="background-color: #ffffff;">
<div class="steam games">`;

    axios
      .get(
        `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_ID}&format=json`
      )
      .then((data) => data.data)
      .then(async (ownedGames) => {
        const gameCount = ownedGames.response.game_count;
        var totalTime = 0;

        // Use Promise.all to wait for all game info to be fetched before responding
        const filteredGames = ownedGames["response"]["games"].filter(
          (game) => game.appid !== 1725640
        );

        try {
          const appinfo = await Promise.all(
            filteredGames.map(async (game) => {
              const extraDataRequest = await axios.get(
                `https://store.steampowered.com/api/appdetails?appids=${game.appid}`
              );
              const extraData = extraDataRequest.data[game.appid].data;
              totalTime += game.playtime_forever;
              return [
                game.appid,
                game.playtime_forever,
                extraData.name,
                extraData.capsule_imagev5,
                extraData.short_description,
              ];
            })
          );

          if (req.query.sort === "playtime") {
            appinfo.sort((a, b) => b[1] - a[1]);
          } else if (req.query.sort === "name") {
            appinfo.sort((a, b) => {
              const nameA = a[2] || "";
              const nameB = b[2] || "";
              return nameA.localeCompare(nameB);
            });
          }

          const responses = await Promise.all(
            appinfo.map(async (appdata) => {
              let colour = { hex: "#cccccc" };
              if (appdata[3]) {
                try {
                  colour = await getAverageColor(appdata[3]);
                } catch (e) {
                  // fallback color if image fails
                  colour = { hex: "#cccccc" };
                }
              }

              return `<img style="border-style: outset; border-color: ${
                colour.hex
              }; margin-down: 3px; margin-right: 3px; width: 12%; height: auto; transition: filter 0s ease;" src="${
                appdata[3]
              }" alt="Game" title="${appdata[2]}\n\n${
                appdata[4]
              }\n\nMy Playtime: ${(appdata[1] / 60).toFixed(
                1
              )} Hours\n(Click to view on Steam!)" onclick="redir(${
                appdata[0]
              })"     onmouseover="brightenImage(this)" 
    onmouseout="resetImage(this)"/>`;
            })
          );

          responses.forEach((game) => {
            html += game;
          });

          res.send(
            html +
              `
            <h3>Total playtime for all ${gameCount - 1} games: ${(
                totalTime / 60
              ).toFixed(1)} hours.</h3>
          </div>
          </body>
          </html>`
          );
        } catch (err) {
          const errmessage = err.message;
          console.error("Error fetching game info:", errmessage);
          res
            .status(500)
            .send("Failed to fetch game information: " + errmessage);
        }
      });
  },
};
