// Import necessary modules
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    //setting the destination of the file
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads')
    },
    //setting the unique name of the file
    filename: function (req, file, cb) {
        //use the crypto library to randomly generate the name of the file 
        crypto.randomBytes(12, function (err, bytes) {
            //here we are generating the random number of the file bytes for the file and converting them to hex and to get the file extenstion we habe used the path and the file orignal for the fetching of it.
            const fn = bytes.toString("hex") + path.extname(file.originalname);
            //null is the errro and fn is the file name
            cb(null, fn);
        })
    }
})

const upload = multer({ storage: storage });
module.exports = upload;