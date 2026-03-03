import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "#config/nodemailer.js";
import { JWT_EXPIRATION } from "#constants/others.js";
import AppError from "#exceptions/app.error.js";
import User from "#modules/user/user.model.js";

export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  const cleanEmail = email.toLowerCase().trim();
  
  let user = await User.findOne({ email: cleanEmail });

  if (user && user.isVerified) {
    throw new AppError("User already exists and is verified", 409);
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
    subject: 'Your verification OTP for EduVerse',
    text: `Hello ${user.name},\n\nYour OTP is: ${otp}\nValid for 10 minutes.\n`
  };

  await transporter.sendMail(mailOptions);
  
  return user;
};

export const verifyEmail = async (email, otp) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await userModel.findOne({ email: cleanEmail });

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
  user.verifyOtpExpireAt = 0; // reset to default
  
  await user.save();
  return user;
};

export const loginUser = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    throw new AppError("User not found. Please sign up instead.", 404);
  }

  if (!user.isActivated) {
    throw new AppError("Your account has been blocked.", 403);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email first", 401, { needVerify: true });
  }

  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { 
    expiresIn: JWT_EXPIRATION 
  });

  return { 
    token, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      pfpImg: user.pfpImg 
    } 
  };
};

