import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UPLOAD_DURATION, VIEW_DURATION } from "#shared/constants/video.js";

let s3Client = null;

export const getS3Client = () => {
  if (!s3Client) {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY) {
      throw new Error("AWS Credentials or Region are missing.");
    }

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

export const getObject = async (key) => {
  try {
    const s3 = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const data = await s3.send(command);

    return data.Body;
  } catch (error) {
    console.error("> S3 Service [getObject] Error: ", error);
    throw new Error(error.message);
  }
};

export const generateStreamUrl = async (key, duration = VIEW_DURATION) => {
  try {
    const s3 = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: duration });
  } catch (error) {
    console.error("> S3 Service [generateStreamUrl] Error: ", error);
    throw error;
  }
};

export const generateUploadUrl = async (fileName, contentType, duration = UPLOAD_DURATION) => {
  try {
    const s3 = getS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: duration });
    return { uploadUrl: url, key: fileName };
  } catch (error) {
    console.error("> S3 Service [generateUploadUrl] Error: ", error);
    throw error;
  }
};

export const removeManyObjects = async (keys) => {
  if (!keys?.length) return { success: true, deletedCount: 0 };

  const s3 = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET;
  
  const BATCH_SIZE = 1000;
  let totalDeleted = 0;
  let allErrors = [];

  try {
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const chunk = keys.slice(i, i + BATCH_SIZE);
      
      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: false,
        },
      });

      const { Deleted, Errors } = await s3.send(command);
      
      totalDeleted += Deleted?.length || 0;
      if (Errors?.length) allErrors.push(...Errors);
    }

    if (allErrors.length > 0) {
      console.warn(`> S3 Batch Delete partial failure: ${allErrors.length} errors.`);
    }

    return {
      success: allErrors.length === 0,
      deletedCount: totalDeleted,
      errors: allErrors,
    };

  } catch (error) {
    console.error("> S3 Service [removeManyObjects] Fatal Error:", error);
    return { success: false, error: error.message, deletedCount: totalDeleted };
  }
};
