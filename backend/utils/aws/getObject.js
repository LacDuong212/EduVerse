import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from "./s3-credentials.js";


export const getObject = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const s3 = getS3Client();
    const data = await s3.send(command);

    return data.Body;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const generateStreamUrl = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const s3 = getS3Client();

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // expires in 60s

    return signedUrl;
  } catch (error) {
    console.error("Failed to generate stream url: ", error);
    throw error;
  }
};
