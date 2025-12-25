import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js';
import transporter from '../configs/nodemailer.js';


export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    const existingAdmin = await adminModel.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({ success: false, message: "Admin already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const admin = new adminModel({
      name,
      email,
      password: hashPassword,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });

    await admin.save();

    // Send OTP to email
    const mailOptions = {
      from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
      to: admin.email,
      subject: 'Your verification OTP for EduVerse',
      text: `Hello ${admin.name},\n\nYour OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.\n\nThank you!\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Registration successful. Please verify your email with OTP." });

  } catch (error) {
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
}

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (admin.isVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }
    if (admin.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (admin.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    admin.isVerified = true;
    admin.verifyOtp = '';
    admin.verifyOtpExpireAt = null;
    await admin.save();

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

  try {

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!admin.isVerified) {
      return res.status(401).json({
        success: false,
        needVerify: true,
        message: "Please verify your email first"
      });
    }

    if (!admin.isApproved) {
      return res.json({ success: false, message: 'Your account has not been approved yet.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.status(200).json({ success: true, message: "If this email is registered, a password reset OTP will be sent." });
        }

        if (!admin.isVerified) {
            return res.status(401).json({ success: false, message: "Account not verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.verifyOtp = otp;
        admin.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await admin.save();

        await transporter.sendMail({
            from: `"EduVerse Support" <${process.env.MAIL_FROM}>`,
            to: admin.email,
            subject: "Password Reset OTP",
            text: `Hello ${admin.name},\n\nYour account recovery OTP is: ${otp}\nThis code is valid for 10 minutes.\n\nThank you!`
        });

        return res.status(200).json({ success: true, message: "New OTP sent to your email" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        if (!admin.isVerified) {
            return res.status(401).json({ success: false, message: "Account not verified" });
        }

        if (admin.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (admin.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedNewPassword;

        admin.verifyOtp = '';
        admin.verifyOtpExpireAt = null;
        await admin.save();

        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
}

export const isAuthenticated = (req, res) => {
    try {
        if (req.admin) {
            return res.status(200).json({
                success: true,
                message: "Admin is authenticated",
                adminId: req.adminId,
                admin: req.admin
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
    return res.status(500).json({ success: false, message: error.message });
  }
}