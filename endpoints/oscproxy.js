const axios = require("axios");

module.exports = {

    "get/api/v3/information": async function (req,res) {
        console.log(req)
        axios.get("https://hbb1.oscwii.org/api/v3/information").then(async function(data) {
           await res.send(data.data)
        })
    },
        "get/api/v3/contents": async function (req,res) {
             console.log(req)
        axios.get("https://hbb1.oscwii.org/api/v3/contents").then(async function(data) {
            var apps = data.data
            apps.sort((a, b) => a.name.localeCompare(b.name));
           await res.send(apps)
        })
    },

}