import AppError from "#exceptions/app.error.js";
import { getAvatarUploadParams } from "#modules/image/image.service.js";
import User from "./user.model.js";

export const getAvatarParams = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    isVerified: true,
    isActivated: true,
  }).lean();

  if (!user) throw new AppError("User not found.", 404);

  return getAvatarUploadParams(userId);
};