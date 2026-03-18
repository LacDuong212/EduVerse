import bcrypt from "bcryptjs";
import AppError from "#exceptions/app.error.js";
import { getAvatarUploadParams } from "#modules/image/image.service.js";
import { withTransaction } from "#utils/transaction.js";
import * as userMapper from "./user.mapper.js";
import User from "./user.model.js";

const activeFilters = {
  isVerified: true,
  isActivated: true,
};

export const getAvatarParams = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    ...activeFilters
  }).lean();

  if (!user) throw new AppError("User not found.", 404);

  return getAvatarUploadParams(userId);
};

export const changePassword = async (
  userId, oldPassword, newPassword
) => {
  if (!oldPassword || !newPassword)
    throw new AppError("Passwords are required.", 400);

  const user = await User.findOne({
    _id: userId,
    ...activeFilters
  }).select("+password");
  if (!user) throw new AppError("User not found.", 404);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError("Current password is incorrect.", 401);

  const hashPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashPassword;
  await user.save();
};

export const updateInterests = async (userId, interests) => {
  if (!interests && !Array.isArray(interests))
    throw new AppError("Interests must be an array.", 400);

  const updated = await User.findByIdAndUpdate(
    userId,
    { interests: interests },
    { new: true, lean: true }
  );

  return updated.interests;
};

export const updateProfile = async (
  userId,
  changes,
  session = null
) => {
  if (!changes && !Object.keys(changes).length)
    throw new AppError("Please provide at least one field to update profile.", 400);

  return await withTransaction(async (s) => {
    const user = await User.findByIdAndUpdate(
      userId, 
      { ...changes }, 
      { session: s, new: true }
    );
    if (!user) throw new AppError("User not found.", 404);

    return userMapper.toUserDetailsDto(user);
  }, session);
};