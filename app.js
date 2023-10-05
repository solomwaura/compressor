const express = require("express")
const app = express()
const http = require("http").createServer(app)
 
// [other modules]

const compressImages = require("compress-images")
const formidable = require("express-formidable")
app.use(formidable())
 
const fileSystem = require("fs")
app.set("view engine", "ejs")
 
const port = process.env.PORT || 3300

 
http.listen(port, function () {
    console.log("Server started running at port: http://127.0.0.1:" + port)
 
    app.post("/compressImage", function (request, result) {
        const image = request.files.image
        if (image.size > 0) {
     
            if (image.type == "image/png" || image.type == "image/jpeg") {
                fileSystem.readFile(image.path, function (error, data) {
                    if (error) throw error
     
                    const filePath = "temp-uploads/" + (new Date().getTime()) + "-" + image.name
                    const compressedFilePath = "uploads/"
                    const compression = 60
                     
                    fileSystem.writeFile(filePath, data, async function (error) {
                        if (error) throw error
                         
                        compressImages(filePath, compressedFilePath, { compress_force: false, statistic: true, autoupdate: true }, false,
                            { jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
                            { png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
                            { svg: { engine: "svgo", command: "--multipass" } },
                            { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
                            async function (error, completed, statistic) {
                                console.log("-------------")
                                console.log(error)
                                console.log(completed)
                                console.log(statistic)
                                console.log("-------------")
     
                                fileSystem.unlink(filePath, function (error) {
                                    if (error) throw error
                                })
                            }
                        )
     
                        result.send("File has been compressed and saved.")
                    })
     
                    fileSystem.unlink(image.path, function (error) {
                        if (error) throw error
                    })
                })
            } else {
                result.send("Please select an image")
            }
        } else {
            result.send("Please select an image")
        }
    })
 
    app.get("/", function (request, result) {
        result.render("index")
    })
    
})