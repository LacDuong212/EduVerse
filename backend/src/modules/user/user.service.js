import bcrypt from "bcryptjs";
import AppError from "#exceptions/app.error.js";
import { updateCoursesInstructorInfo } from "#modules/course/course.service.js";
import { deleteImage, getAvatarUploadParams } from "#modules/image/image.service.js";
import { withTransaction } from "#utils/transaction.js";
import User, { ROLE_ENUM } from "./user.model.js";

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

export const changePassword = async (userId, oldPassword, newPassword) => {
  return await withTransaction(async (s) => {
    if (!oldPassword || !newPassword) {
      throw new AppError("Passwords are required.", 400);
    }

    const user = await User.findOne({
      _id: userId,
      ...activeFilters
    })
      .select("+password")
      .session(s);

    if (!user) throw new AppError("User not found.", 404);

    if (!user?.password) throw new AppError("You haven't set a password yet. Try resetting your password with Forget Password!");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new AppError("Invalid credentials.", 401);

    const isSameAsOld = await user.comparePassword(newPassword);
    if (isSameAsOld)
      throw new AppError("Please use a different password.", 400);

    user.password = newPassword;
    await user.save({ session: s });
  });
};

export const updateProfile = async (userId, changes, session = null) => {
  if (!changes || Object.keys(changes).length === 0) return null;

  let imageToDelete = null;
  let updatedUser = null;

  await withTransaction(async (s) => {
    const userDoc = await User.findOne({ _id: userId, ...activeFilters }).session(s);
    if (!userDoc) throw new AppError("User not found.", 404);

    const oldPfp = userDoc.pfpImg;
    const oldName = userDoc.name;

    Object.keys(changes).forEach((key) => {
      userDoc.set(key, changes[key]);
    });

    if (changes.pfpImg && changes.pfpImg !== oldPfp && oldPfp) imageToDelete = oldPfp;

    if (userDoc.role === ROLE_ENUM.instructor)
      if (changes.name !== oldName || imageToDelete)
        await updateCoursesInstructorInfo(userId, userDoc.name, userDoc.pfpImg, s);

    await userDoc.save({ session: s });
    updatedUser = userDoc.toObject();
  }, session);

  if (imageToDelete) await deleteImage(imageToDelete);

  return updatedUser;
};

export const deactivateAccount = async (userId) => {
  if (!userId) throw new AppError("User ID is required.", 400);

  const user = await User.findOneAndUpdate(
    { _id: userId, ...activeFilters },
    { $set: { isActivated: false } },
    { new: true }
  );
  
  if (!user) throw new AppError("User not found or already deactivated.", 404);
};