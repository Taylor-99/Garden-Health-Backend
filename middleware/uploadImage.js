
const multer = require("multer");
require("dotenv").config();

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
        } else {
          cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
        }
    };

    // const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, './uploads')
    // },
    // filename: function (req, file, cb) {
    //   // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   const { originalname } = file;
    //   cb(null, `${uuid()} - ${originalname}`)
    // }
    // });

    const storage = multer.memoryStorage()

    const upload = multer({storage: storage, fileFilter})

  module.exports = upload;