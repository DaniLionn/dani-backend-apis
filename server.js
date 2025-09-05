const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");

fs.promises.readdir("./modules").then((modules) => {
  modules.forEach((module) => {
    const start = require("./modules/" + module);

    start();
  });
});
