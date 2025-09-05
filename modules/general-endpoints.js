module.exports = function start() {
  const express = require("express");

  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/general", function (req, res) {
    res.send("Hello World! General API Module is running!");
  });

  app.get("/general/time/:region/:city", function (req, res) {
    const region = req.params.region;
    const city = req.params.city;

    timezone = `${region}/${city}`;

    if (!region || !city || (!region && !city)) {
      res.status(400).send("No timezone specified.");
    }

    const date = new Date();

    var options;

    options = {
      timeZone: timezone,
    };

    let d = date.toLocaleDateString("en-US", options);
    let dateSplit = d.split("/");
    let t = date.toLocaleTimeString("en-US", options);
    let timeSplit = t.split(":");
    let AMPM = timeSplit[2].split(" ")[1].replace(/\\s+/g, "");
    let second = timeSplit[2].split(" ")[0];

    let northernHemisphereSeason;
    let southernHemisphereSeason;

    if (dateSplit[0] == "12" || dateSplit[0] == "1" || dateSplit[0] == "2") {
      northernHemisphereSeason = "Winter";
      southernHemisphereSeason = "Summer";
    } else if (
      dateSplit[0] == "3" ||
      dateSplit[0] == "4" ||
      dateSplit[0] == "5"
    ) {
      northernHemisphereSeason = "Spring";
      southernHemisphereSeason = "Fall";
    } else if (
      dateSplit[0] == "6" ||
      dateSplit[0] == "7" ||
      dateSplit[0] == "8"
    ) {
      northernHemisphereSeason = "Summer";
      southernHemisphereSeason = "Winter";
    } else if (
      dateSplit[0] == "9" ||
      dateSplit[0] == "10" ||
      dateSplit[0] == "11"
    ) {
      northernHemisphereSeason = "Fall";
      southernHemisphereSeason = "Spring";
    }

    let data = {
      data: {
        date: {
          month: dateSplit[0],
          day: dateSplit[1],
          year: dateSplit[2],
        },
        time: {
          hour: timeSplit[0],
          minute: timeSplit[1],
          second: second,
          AMPM: AMPM,
        },
        seasonNH: northernHemisphereSeason,
        seasonSH: southernHemisphereSeason,
        timeZone: timezone,
        requestFufilled: Math.floor(Date.now() / 1000),
      },
    };

    res.send(data);
  });

  app.listen(3000);
  console.log("General API Module running");
};
