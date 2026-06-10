import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { WELCOME_NOTIFICATIONS } from "#constants/others.js";
import AppError from "#exceptions/app.error.js";
import { isApprovedInstructor } from "#modules/instructor/instructor.service.js";
import { sendNotification } from "#modules/notification/notification.service.js";
import { TYPE_ENUM as NOTIF_TYPE } from "#modules/notification/notification.model.js";
import { createNewStudent, getStudentInterests } from "#modules/student/student.service.js";
import { toAuthUserDto } from "#modules/user/user.mapper.js"
import User, { ROLE_ENUM as USER_ROLE } from "#modules/user/user.model.js";
import * as mailService from "#services/mail.service.js";
import logger from "#utils/logger.js";
import { withTransaction } from "#utils/transaction.js";

const validateOtp = (user, otp) => {
  if (!user || user.verifyOtp !== otp || !user.verifyOtpExpireAt)
    throw new AppError("Invalid OTP.", 400);
  if (user.verifyOtpExpireAt < Date.now())
    throw new AppError("OTP has expired.", 400);
};

export const registerUser = async ({ name, email, password }) => {
  const cleanEmail = email.toLowerCase().trim();

  return await withTransaction(async (session) => {
    let user = await User.findOne({ email: cleanEmail }).session(session);

    if (!user)
      user = new User({ email: cleanEmail });
    else if (user.isVerified)
      throw new AppError("User already exists. Please login!", 409);

    user.name = name;
    user.password = password;
    const otp = user.setOtp();

    await user.save({ session });

    await createNewStudent(user._id, session);

    const randomIndex = Math.floor(Math.random() * WELCOME_NOTIFICATIONS.length);
    const dynamicWelcomeMessage = WELCOME_NOTIFICATIONS[randomIndex];

    await sendNotification(
      user._id,
      NOTIF_TYPE.info,
      dynamicWelcomeMessage,
      session
    );

    await mailService.sendVerificationEmail(user.email, user.name, otp);
    return toAuthUserDto(user);
  });
};

export const loginUser = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Wrong email or password.", 401);

  if (!user.isActivated) throw new AppError("Account deactivated.", 403, { reactivate: true });
  if (!user.isVerified) throw new AppError("Account not verified.", 401, { needVerify: true });

  if (user.role === USER_ROLE.instructor && !(await isApprovedInstructor(user._id)))
    throw new AppError("Account is blocked.", 403);

  if (user.role === USER_ROLE.student)
    user.interests = await getStudentInterests(user._id);

  return toAuthUserDto(user);
};

export const sendResetOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) return false;
  if (!user.isVerified) throw new AppError("Account not verified.", 401);

  const otp = user.setOtp();
  await user.save();

  await mailService.sendPasswordResetEmail(user.email, user.name, otp);

  return true;
};

export const resetPassword = async (email, otp, newPassword) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });
  if (!user?.isVerified) throw new AppError("Account not verified.", 401);

  validateOtp(user, otp);

  user.password = newPassword;
  user.verifyOtp = '';
  user.verifyOtpExpireAt = 0;

  await user.save();
};

export const sendVerificationOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) return false;
  if (user.isVerified) throw new AppError("Account already verified.", 400);

  const otp = user.setOtp();
  await user.save();

  await mailService.sendVerificationEmail(user.email, user.name, otp);

  return true;
};

export const verifyEmail = async (email, otp) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });
  if (user?.isVerified) throw new AppError("Account already verified.", 400);

  validateOtp(user, otp);

  user.isVerified = true;
  user.verifyOtp = '';
  user.verifyOtpExpireAt = 0;

  await user.save();
  return toAuthUserDto(user);
};

export const sendReactivationOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) return false;
  if (!user.isVerified) throw new AppError("Account not verified.", 401);
  if (user.isActivated) throw new AppError("Account already activated.", 400);

  const otp = user.setOtp();
  await user.save();

  await mailService.sendReactivationEmail(user.email, user.name, otp);

  return true;
};

export const reactivateAccount = async (email, otp) => {
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });
  if (!user?.isVerified) throw new AppError("Account not verified.", 401);

  validateOtp(user, otp);

  user.isActivated = true;
  user.verifyOtp = '';
  user.verifyOtpExpireAt = 0;

  await user.save();

  return toAuthUserDto(user);
};

export const checkValidUser = async (user) => {
  const isValid = !!(user?.userId && mongoose.Types.ObjectId.isValid(user.userId));
  if (user && user.role === USER_ROLE.student)
    user.interests = await getStudentInterests(user.userId);
  return { isValid, user: isValid ? user : null };
};

export const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).lean();
    return user ? toAuthUserDto(user) : null;
  } catch (err) {
    logger.error("Decode JWT error:", err);
    return null;
  }
};