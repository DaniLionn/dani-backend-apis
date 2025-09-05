const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");

const express = require("express");

const app = express();

fs.promises.readdir("./modules").then((modules) => {
  modules.forEach((module) => {
    const start = require("./modules/" + module);

    start();
  });
});

app.get("/", async function (req, res) {
  const modules = await fs.promises.readdir("./modules");

  var endpointString = "Here's the avaliable endpoints.\n\n";

  modules.forEach((module) => {
    endpointString += "/" + module.replace("-endpoints.js", "") + "\n";
  });

  res.send("Hello World! Dani's API is running!\n" + endpointString);
});

app.listen(3000);
