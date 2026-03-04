import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import transporter from "#config/nodemailer.js";
import AppError from "#exceptions/app.error.js";
import { toAuthUserDto } from "#modules/user/user.mapper.js"
import User from "#modules/user/user.model.js";

export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  const cleanEmail = email.toLowerCase().trim();
  
  let user = await User.findOne({ email: cleanEmail });

  if (user && user.isVerified) {
    throw new AppError("User already exists. Please login instead!", 409);
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000;

  if (!user) {
    user = new User({
      name,
      email: cleanEmail,
      password: hashPassword,
      verifyOtp: otp,
      verifyOtpExpireAt: otpExpiry,
    });
  } else {
    user.name = name;
    user.password = hashPassword;
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpiry;
  }

  await user.save();

  const mailOptions = {
    from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
    to: user.email,
    subject: "Your verification OTP for EduVerse",
    text: `Hello ${user.name},\n\nYour OTP is: ${otp}\nValid for 10 minutes.\n`
  };

  await transporter.sendMail(mailOptions);
  
  return user;
};

export const verifyEmail = async (email, otp) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    throw new AppError("Account already verified", 400);
  }

  if (user.verifyOtp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (user.verifyOtpExpireAt < Date.now()) {
    throw new AppError("OTP has expired", 400);
  }

  user.isVerified = true;
  user.verifyOtp = '';
  user.verifyOtpExpireAt = 0;
  
  await user.save();
  return user;
};

export const loginUser = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    throw new AppError("Invalid email or password.", 401); 
  }

  if (!user.isActivated) {
    throw new AppError("Your account has been blocked.", 403);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email first!", 401, { needVerify: true });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return toAuthUserDto(user);
};

export const sendPasswordResetOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await userModel.findOne({ email: cleanEmail });

  if (!user) {
    return false;
  }

  if (!user.isVerified) {
    throw new AppError("Account not verified!", 401);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
  
  await user.save();

  await transporter.sendMail({
    from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
    to: user.email,
    subject: "Password Reset OTP",
    text: `Hello ${user.name},\n\nYour account recovery OTP is: ${otp}\nThis code is valid for 10 minutes.\n\nThank you!`
  });

  return true;
};

export const resetPassword = async (email, otp, newPassword) => {
  const cleanEmail = email.toLowerCase().trim();
  
  const user = await userModel.findOne({ email: cleanEmail });

  if (!user) {
    return false;
  }

  if (!user.isVerified) {
    throw new AppError("Account not verified", 401);
  }

  if (user.verifyOtp !== otp || user.verifyOtp === '') {
    throw new AppError("Invalid OTP", 400);
  }

  if (user.verifyOtpExpireAt < Date.now()) {
    throw new AppError("OTP has expired", 400);
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  user.verifyOtp = '';
  user.verifyOtpExpireAt = 0;

  await user.save();
  return true;
};

export const resendVerificationOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await userModel.findOne({ email: cleanEmail });

  if (!user) {
    return false;
  }

  if (user.isVerified) {
    throw new AppError("Account is already verified. Please login.", 400);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
  
  await user.save();

  await transporter.sendMail({
    from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
    to: user.email,
    subject: "Verify Email",
    text: `Hello ${user.name},\n\nYour email verification OTP is: ${otp}\nThis code is valid for 10 minutes.\n\nThank you!`
  });

  return true;
};

export const checkValidUser = (user) => {
  if (user && Object.keys(user).length > 0) {
    if (user.userId && mongoose.Types.ObjectId.isValid(user.userId)) {
      return {
        isValid: true,
        user: user,
      };
    }
  }

  return {
    isValid: false,
    user: null,
  };
};