import {GetObjectCommand} from "@aws-sdk/client-s3"
import { getS3Client } from "./s3-credentials";


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