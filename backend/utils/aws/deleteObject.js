import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "./s3-credentials.js";


export const deleteObject = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    const s3 = getS3Client();
    const data = await s3.send(command);

    if (data.$metadata.httpStatusCode !== 204) {
      return { status: 400, data };
    }

    return { status: 204 };
  } catch (error) {
    throw new Error(error.message);
  }
};