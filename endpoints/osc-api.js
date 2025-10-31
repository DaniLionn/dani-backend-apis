const axios = require("axios");
module.exports = {
  "get/api/v3/information": async function (req, res) {
    await axios
      .get("https://hbb1.oscwii.org/api/v3/information")
      .then((response) => {
        response.data.provider = "Open Shop Channel (Sorted)";
        res.send(response.data);
      })
      .catch((error) => {
        res.status(500).send({ error: "Failed to fetch information" });
      });
  },
  "get/api/v3/contents": function (req, res) {
    axios
      .get("https://hbb1.oscwii.org/api/v3/contents")
      .then((response) => {
        const data = response.data;
        const sortByName = (arr) =>
          arr.sort((a, b) => {
            const na = ((a && a.name) || "").toString().toLowerCase();
            const nb = ((b && b.name) || "").toString().toLowerCase();
            if (na < nb) return -1;
            if (na > nb) return 1;
            return 0;
          });

        if (Array.isArray(data)) {
          res.send(sortByName(data));
          return;
        }

        if (data && typeof data === "object") {
          Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
              data[key] = sortByName(data[key]);
            }
          });
          res.send(data);
          return;
        }

        res.send(data);
      })
      .catch((error) => {
        res.status(500).send({ error: "Failed to fetch contents" });
      });
  },
};
