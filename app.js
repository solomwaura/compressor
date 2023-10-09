const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const app = express();
const port = 3300;

const fileSystem = require("fs")
app.set("view engine", "ejs")

const storage = multer.memoryStorage(); // Store the uploaded image in memory
const upload = multer({ storage: storage });

app.post("/compressImage", upload.single('image'), function (request, result) {
    const image = request.file; // Use request.file to access the uploaded file

    if (image && image.size > 0) {
        if (image.mimetype == "image/png" || image.mimetype == "image/jpeg") {
            const tempDir = os.tmpdir(); // Get the system's temporary directory

            // Generate a unique filename for the uploaded image
            const uniqueFileName = new Date().getTime() + '-' + image.originalname;
            const filePath = path.join(tempDir, uniqueFileName);

            console.log('the file path is:', filePath);

            const sharpStream = sharp(image.buffer).jpeg({ quality: 60 });

            result.setHeader('Content-Disposition', 'attachment; filename="compressed-image.jpg"');

            const responseStream = sharpStream.pipe(result);

            responseStream.on('error', (error) => {
                console.error('Error sending the image:', error);
            
                // Check if the file exists before attempting to delete it
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, function (deleteError) {
                        if (deleteError) console.error('Error deleting the file:', deleteError);
                    });
                }
            });
            
            // Notify when the response stream ends
            responseStream.on('finish', () => {
                // Check if the file exists before attempting to delete it
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, function (deleteError) {
                        if (deleteError) console.error('Error deleting the file:', deleteError);
                    });
                }
            });

              
        } else {
            result.send("Please select a valid image (PNG or JPEG).");
        }
    } else {
        result.send("Please select an image.");
    }
});

app.get("/", function (request, result) {
    result.render("index")
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
