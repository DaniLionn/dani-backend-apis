const path = require("path");
const fs = require("fs");
module.exports = {
  "/roblox/leederboard/incrementScore": function (req, res) {
    const name = req.query.name;
    var read = JSON.parse(
      fs.readFileSync("/var/data/lee-wars-leaderboard.json", "utf8")
    );

    read[name] = read[name] + 1 || 1;
    fs.writeFileSync(
      "/var/data/lee-wars-leaderboard.json",
      JSON.stringify(read)
    );
    res.send("ok");
  },
};
