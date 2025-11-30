import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;