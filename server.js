//render adds a port variable to the environment and also loads .env files automatically
//so this just checks for that to tell if it needs to load the .env or not
if (!process.env.PORT) {
  require("dotenv").config();
}
const started = new Date().getTime();
const express = require("express");
const fs = require("node:fs");
const app = express();
const { startLee } = require("./Lee-Bot/lee.js");
app.use(express.json({ limit: "128kb" }));

function deployEndpoints(endpoint) {
  const split = endpoint[0].split("/");
  const method = split[0];
  let endpointUrl = "";

  split.forEach((part) => {
    if (part !== method) {
      endpointUrl += "/" + part;
    }
  });

  if (method === "init") {
    endpoint[1]();
  } else if (method === "get") {
    app.get(endpointUrl, function (req, res) {
      endpoint[1](req, res);
    });
  } else if (method === "post") {
    app.post(endpointUrl, function (req, res) {
      endpoint[1](req, res);
    });
  }
}

console.log("Loading endpoint modules...");

fs.readdir("./endpoints", (err, files) => {
  if (err) {
    console.error("Error loading endpoint modules! " + err);
    return;
  }

  files.forEach((file) => {
    console.log("Loading " + file + "...");
    let endpointData = require("./endpoints/" + file);
    if (JSON.stringify(endpointData) !== {}) {
      Object.entries(endpointData).forEach((endpoint) => {
        deployEndpoints(endpoint);
      });
    }
  });

  console.log("Done!");
});

app.get("/", async function (_, res) {
  res.sendFile("index.htm");
});

app.listen(process.env.PORT || 3000);
startLee().then(function () {

  console.log("Lee process exited!")

})



