const { spawn }= require("child_process")

module.exports = {

    "get/kekatsu": async function(req,res) {

        const process = spawn("curl https://gist.githubusercontent.com/cavv-dev/3c0cbc1b63ac8ca0c1d9f549403afbf1/raw/", )


        process.on("message", ((msg) => {
            res.send(msg.toString())
        }))

        process.on("exit", ((code) => {

        }))
        
        
    }

}