import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../configs/nodemailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "All fields are required" });
    }

    try {

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashPassword = await bycrypt.hash(password, 10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new userModel({
            name,
            email,
            password: hashPassword,
            verifyOtp: otp,
            verifyOtpExpireAt: Date.now() + 10 * 60 * 1000
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        // Send OTP to user's email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your verification OTP for EduVerse',
            text: `Hello ${user.name},\n\nYour OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.\n\nThank you!\n`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Registration successful. Please verify your email with OTP." });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" });
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid email" });
        }

        if (!user.isVerified) {
            return res.json({ success: false, needVerify: true, message: "Please verify your email first" });
        }

        const isMatch = await bycrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({ success: true, message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async(req, res) => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({ success: true, message: "Logout successful" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Verify OTP
export const verifyOtp = async(req, res) => {

    const { email, otp } = req.body;

    if(!email || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        const user = await userModel.findOne({ email });

        if(!user){
            return res.json({ success: false, message: "User not found" });
        }

        if(user.isVerified) {
            return res.json({ success: false, message: "User already verified" });
        }

        if(user.verifyOtp ==='' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if(user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP has expired" });
        }

        user.isVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isAuthenticated = (req, res) => {
    try {
        return res.json({ success: true, message: "User is authenticated", userId: req.userId });
    } catch (error) {
        return res.json({ success: false, message: "Invalid token" });
    }
}
    ;
// Send OTP to reset password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if(!user.isVerified) {
            return res.json({ success: false, message: "Account not verified" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 phút
        await user.save();
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Hello ${user.name},\n\nYour account recovery OTP is: ${otp}\nThis code is valid for 10 minutes.\n\nThank you!`
        });
        return res.json({ success: true, message: "New OTP sent to your email" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
// Verify ResetOTP
export const resetPassword = async (req, res) => {
    try {

        const { email, otp, newPassword } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isVerified) {
            return res.json({ success: false, message: "Account not verified" });
        }

        if (user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP has expired" });
        }

        const hashedNewPassword = await bycrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// ✅ Chỉ check OTP hợp lệ (không đổi password)
export const checkResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isVerified) {
            return res.json({ success: false, message: "Account not verified" });
        }

        if (user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP has expired" });
        }

        return res.json({ success: true, message: "OTP verified successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
