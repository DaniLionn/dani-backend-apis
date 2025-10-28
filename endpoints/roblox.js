const path = require("path");
const fs = require("fs");
module.exports = {
  "get/roblox/leederboard/incrementScore": function (req, res) {
    const name = req.query.name;
    const id = req.query.id;
    var read = JSON.parse(
      fs.readFileSync("/var/data/lee-wars-leaderboard.json", "utf8")
    );

    read[`[${name}](https://www.roblox.com/users/${id}/profile)`] =
      read[`[${name}](https://www.roblox.com/users/${id}/profile)`] + 1 || 1;
    fs.writeFileSync(
      "/var/data/lee-wars-leaderboard.json",
      JSON.stringify(read)
    );
    res.send("ok");
  },
};
