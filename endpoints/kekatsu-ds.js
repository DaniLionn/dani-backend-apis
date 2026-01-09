const axios = require("axios")

module.exports = {

    "get/kekatsu": async function(req,res) {

        const apps = await axios.get("https://gist.githubusercontent.com/cavv-dev/3c0cbc1b63ac8ca0c1d9f549403afbf1/raw/").data
        res.send(apps)
    }

}