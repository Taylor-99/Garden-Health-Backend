
const aws = require("@aws-sdk/client-s3");
const { fromCredentials } = require('@aws-sdk/credential-providers');
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();
const path = require('path');

// const s3 = new aws.S3();

    // const s3 = new aws.S3({
    //     region: process.env.REGION,
    //     credentials:{ 
    //         accessKeyId: process.env.ACCESS_KEY, 
    //         secretAccessKey: process.env.ACCESS_SECRET, }
    // });

    // const s3 = new aws.S3Client({ region: process.env.REGION, 
    //     credentials: fromCredentials({ 
    //         accessKeyId: process.env.ACCESS_KEY, 
    //         secretAccessKey: process.env.ACCESS_SECRET, }), });

//     const fileFilter = (req, file, cb) => {
//         if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//         cb(null, true);
//         } else {
//         cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
//         }
//     };

//   console.log(s3)

//     const upload = multer({
//         fileFilter,
//         storage: multerS3({
//         acl: "public-read",
//         s3: {accessKeyId: process.env.ACCESS_KEY, 
//             secretAccessKey: process.env.ACCESS_SECRET},
//         bucket: 'gardenhealth',
//         metadata: function (req, file, cb) {
//             cb(null, { fieldName: "UPLOAD_IMAGES" });
//         },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString());
//         },
//         }),
//     });
    const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
    })

    const upload = multer({storage: storage})

  module.exports = upload;