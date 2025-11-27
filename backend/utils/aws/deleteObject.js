import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
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

export const removeObject = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    const s3 = getS3Client();
    
    await s3.send(command); // success either deleted or key not found

    return { success: true };

  } catch (error) {
    console.error(`Failed to remove object for key[${key}]: `, error);
    throw error; 
  }
};

export const removeManyObjects = async (keys) => {
  if (!keys || keys.length === 0) return { success: true, deletedCount: 0 };

  try {
    // S3 expects an array of objects: [{ Key: '...' }, { Key: '...' }]
    const objectsToDelete = keys.map(key => ({ Key: key }));

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false // set to true if the deleted items not matter
      },
    };

    const command = new DeleteObjectsCommand(params);
    const s3 = getS3Client();
    const data = await s3.send(command);

    // data.Deleted contains the list of successfully deleted markers
    // data.Errors contains any that failed
    
    if (data.Errors && data.Errors.length > 0) {
      console.warn('Some S3 objects failed to delete:', data.Errors);
    }

    return { 
      success: true, 
      deletedCount: data.Deleted?.length || 0,
      errors: data.Errors || []
    };

  } catch (error) {
    console.error('S3 Batch Delete Error:', error);
    return { success: false, error: error.message };
  }
};
