const axios = require("axios");

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  "post/proxy/post": function (Request, Res) {
    if (!Request.body.url) {
      Res.send("No url provided");

      return;
    }

    var URL = Request.body.url;
    var postData = Request.body.data;
    //console.log(URL, postData);
    var json;
    if (isValidJSON(URL)) {
      json = JSON.parse(URL);
      //console.log(json);
    } else {
      json = {
        url: URL,
      };
    }

    axios
      .post(json.url, json.data)
      .then((result) => {
        //console.log(result.data);
        Res.send(result.data);
      })
      .catch((err) => {
        //console.log(err.message);
        Res.send(err.message);
      });
  },

  "post/proxy/tokenpost": function (Request, Res) {
    if (!Request.body.url) {
      Res.send("No url provided");

      return;
    }

    var URL = Request.body.url;
    var postData = Request.body.data;
    //console.log(URL, postData);
    var json;
    if (isValidJSON(URL)) {
      json = JSON.parse(URL);
      //console.log(json);
    } else {
      json = {
        url: URL,
      };
    }

    let tok = process.env.ROBLOSECURITY;

    let data = json.data;

    axios
      .post(json.url, data, {
        headers: {
          Cookie: `.ROBLOSECURITY=${tok}`,
        },
      })
      .then((result) => {
        //console.log(result.data);
        Res.send(result.data);
      })
      .catch((err) => {
        //console.log(err.message);
        Res.send(err.message);
      });
  },

  "post/proxy/get": function (Request, Res) {
    if (!Request.body.url) {
      Res.send("No url provided");

      return;
    }

    var URL = Request.body.url;
    //console.log(URL);
    var json;
    if (isValidJSON(URL)) {
      json = JSON.parse(URL);
      //console.log(json);
    } else {
      json = {
        url: URL,
      };
    }

    axios
      .get(json.url)
      .then((result) => {
        //console.log(result.data);
        Res.send(result.data);
      })
      .catch((err) => {
        //console.log(err.message);
        Res.send(err.message);
      });
  },

  "post/proxy/tokenget": function (Request, Res) {
    if (!Request.body.url) {
      Res.send("No url provided");

      return;
    }

    var URL = Request.body.url;
    //console.log(URL);
    var json;
    if (isValidJSON(URL)) {
      json = JSON.parse(URL);
      //console.log(json);
    } else {
      json = {
        url: URL,
      };
    }

    let tok = process.env.ROBLOSECURITY;

    axios
      .get(json.url, {
        headers: {
          Cookie: `.ROBLOSECURITY=${tok}`,
        },
      })
      .then((result) => {
        Res.send(result.data);
      })
      .catch((err) => {
        //console.log(err.message);
        Res.send(err.message);
      });
  },
};
