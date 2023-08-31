import fs from 'fs'
import 'dotenv/config'
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { Client } from 'minio'

console.log(process.env.MINIO_ACCESS_KEY as string)
console.log(process.env.MINIO_SECRET_KEY as string)
console.log((process.env.MINIO_USE_SSL as string) === 'true')

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT_URL as string,
    port: parseInt(process.env.MINIO_ENDPOINT_PORT as string),
    useSSL: (process.env.MINIO_USE_SSL as string) === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string,
})

// Inspired by https://northflank.com/guides/connect-nodejs-to-minio-with-tls-using-aws-s3
const s3 = new S3({
    endpoint: process.env.MINIO_ENDPOINT_URL as string,
    region: process.env.MINIO_REGION as string,
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY as string,
        secretAccessKey: process.env.MINIO_SECRET_KEY as string,
    },
    forcePathStyle: true
});

(async () => {
    try {
        // uploading object with string data on Body
        const bucketEndpointUrl = process.env.MINIO_ENDPOINT_URL as string
        const bucketName = process.env.MINIO_BUCKET_NAME as string
        const fileObjectKey = "test_file.png";
        const fileObjectData = fs.readFileSync("./test_file.png");

        console.log(`Uploading file ${fileObjectKey} to bucket ${bucketName} on MinIO instance at ${bucketEndpointUrl}...`)

        /*         await s3.send(
                    new PutObjectCommand({
                        Bucket: bucketName,
                        Key: fileObjectKey,
                        Body: fileObjectData
                    })
                );
         */

        try {
            await minioClient.fPutObject(bucketName, `media/${fileObjectKey}`, fileObjectKey)
            console.log(`Successfully uploaded ${bucketName}/${fileObjectKey}!`);
        } catch (err) {
            if (err) return console.log(err)
        }
    } catch (err) {
        console.log("Error", err);
    }
})();
