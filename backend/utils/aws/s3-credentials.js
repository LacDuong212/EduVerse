import { S3Client } from "@aws-sdk/client-s3";


let s3Client = null;

export const initS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    console.log("> S3 Client initialized");
  }
  return s3Client;
};

export const getS3Client = () => {
  if (!s3Client) {
    throw new Error("S3 Client not initialized. Call initS3Client() first.");
  }
  return s3Client;
};