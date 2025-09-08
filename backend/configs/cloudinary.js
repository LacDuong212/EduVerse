import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadAvatar = async (filePath, userId) => {
  return cloudinary.uploader.upload(filePath, {
    folder: "avatars",
    public_id: `user_${userId}_avatar`, // overwrite each time
    overwrite: true,
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" }, // auto-crop to face
    ],
  });
};
