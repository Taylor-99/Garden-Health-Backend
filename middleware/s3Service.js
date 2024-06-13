
const { S3 } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const uuid = require("uuid").v4;
require("dotenv").config();

const s3Client = new S3({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_ID,
        secretAccessKey: process.env.ACCESS_KEY,
    },
});

const s3Upload = async (file) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `uploads/${uuid()}-${file.originalname}`,
        Body: file.buffer,
    };

    try {

        const parallelUploads3 = new Upload({
            client: s3Client,
            params: params,
        });

        parallelUploads3.on("httpUploadProgress", (progress) => {
            console.log("progress: ", progress);
        });

        const data = await parallelUploads3.done();
        console.log(data)
        return data;

    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('File upload failed');
    }
};

module.exports = s3Upload;