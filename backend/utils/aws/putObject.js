import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getS3Client } from "./s3-credentials";


export const putObject = async (file, fileName) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: file,
            ContentType: "video/mp4,mov,mkv,avi",
        };

        const command = new PutObjectCommand(params);
        const s3 = getS3Client();
        const data = await s3.send(command);

        if (data.$metadata.httpStatusCode !== 200) {
            throw new Error("Failed to upload file to S3");
        }

        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        return { url, key: params.Key };
    } catch (error) {
        throw new Error(error.message);
    }
};