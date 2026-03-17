import cloudinary,
  { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } from "#config/cloudinary.js";
import logger from "#utils/logger.js";

export const getAvatarUploadParams = (userId) => {
  if (!userId) throw new AppError("User ID is required for avatar upload.", 400);

  const publicId = `u_${userId}_avatar`;
  const folder = "avatars";
  const transformation = "w_500,h_500,c_fill,g_auto,f_auto,q_auto,d_av4_khpvlh";

  return createUploadParams(publicId, folder, transformation);
};

export const getCourseImageUploadParams = (courseId) => {
  if (!courseId) throw new AppError("Course ID is required for image upload.", 400);

  const publicId = `c_${courseId}_img`;
  const folder = "courses";
  const transformation = "w_1200,h_900,c_fill,g_auto,f_auto,q_auto,d_course_default_image";

  return createUploadParams(publicId, folder, transformation);
};

const createUploadParams = (public_id, folder, transformation) => {
  const timestamp = Math.round((new Date()).getTime() / 1000);

  const paramsToSign = {
    timestamp,
    folder,
    public_id,
    overwrite: true,
    transformation,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    public_id,
    folder,
    transformation,
    overwrite: true,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
};

export const deleteFromCloudinary = async (fullPath) => {
  try {
    const result = await cloudinary.uploader.destroy(fullPath, {
      invalidate: true
    });

    if (result.result !== "ok" && result.result !== "not found") {
      logger.error(`> Cloudinary deletion failed for ${fullPath}:`, result);
    }

    return result;
  } catch (error) {
    logger.error("> [deleteFromCloudinary] error:", error);
    return null;
  }
};