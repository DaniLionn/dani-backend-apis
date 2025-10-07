//render adds a port variable to the enviroment and also loads .env files automatically
//so this just checks for that to tell if it needs to load the .env or not
if (!process.env.PORT) {
  require("dotenv").config();
}
const started = new Date().getTime();
const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json({ limit: "128kb" }));

function deployEndpoints(endpoint) {
  const split = endpoint[0].split("/");
  const method = split[0];
  var endpointUrl = "";

  split.forEach((part) => {
    if (part != method) {
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
    var endpointData = require("./endpoints/" + file);
    if (JSON.stringify(endpointData) != {}) {
      Object.entries(endpointData).forEach((endpoint) => {
        deployEndpoints(endpoint);
      });
    }
  });

  console.log("Done!");
});

app.get("/", async function (_, res) {
  const timePassed = new Date().getTime() - started;

  res.send(
    `<!DOCTYPE html>
<html>
  <head>
    <style>
      h1 {text-align: center;}
      p {text-align: center;}
      img {text-align: center;}
      .center {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 10%;
      }
    </style>
  </head>
  <body>
    <h1>Dani's API Server</h1>
    <img src="https://danilionn.github.io/dani-cdn/assets/general/images/fish.gif" alt="funny fish gif" class="center">
    <p>APIs for my various projects</p>
    <p>Uptime (as of page load): ${new Date(timePassed)
      .toISOString()
      .slice(11, 19)}</p>
  </body>
</html>`
  );
});

app.listen(process.env.PORT || 3000);
