import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../configs/nodemailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  try {
    let user = await userModel.findOne({ email: cleanEmail });

    if (user) {
      // if user exists and verified
      if (user.isVerified) {
        return res.status(409).json({ success: false, message: "User already exists" });
      }

      // if user exists but not verified
      console.log(">>> [AUTH]: Resending verification for unverified user...");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      // if user not exist
      user = new userModel({
        name,
        email: cleanEmail,
        password: hashPassword,
        verifyOtp: otp,
        verifyOtpExpireAt: Date.now() + 10 * 60 * 1000,
        isVerified: false
      });
    } else {
      // update existing but not verified user
      user.name = name;
      user.password = hashPassword;
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    }

    await user.save();

    // send OTP
    const mailOptions = {
      from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
      to: user.email,
      subject: 'Your verification OTP for EduVerse',
      text: `Hello ${user.name},\n\nYour OTP is: ${otp}\nValid for 10 minutes.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Registration successful. OTP sent." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Registration error." });
  }
}

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  try {
    const user = await userModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }
    if (user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    user.isVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Please log in to continue.",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  try {
    const user = await userModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please sign up instead." });
    }

    if (!user.isActivated) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact the administrator to unlock it."
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        needVerify: true,
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Email does not exist!" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: "Account not verified!" });
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

    return res.status(200).json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: "Account not verified" });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    user.verifyOtp = '';
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
}

export const isAuthenticated = (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({
        success: true,
        message: "User is authenticated",
        userId: req.userId,
        user: req.user
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Guest user",
        user: null
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const logout = async (req, res) => {
  try {

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      path: '/'
    });

    return res.status(200).json({ success: true, message: "Logout successful" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
}

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Please provide an email!" });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email!" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified. Please login." });
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

    return res.status(200).json({ success: true, message: "OTP sent. Please check your email!" });
  } catch (error) {
    console.error(">>> [AUTH]: Sending OTP error: ", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};