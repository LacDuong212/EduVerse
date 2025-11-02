import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import adminModel from '../models/adminModel.js';
import transporter from '../configs/nodemailer.js';
import Fuse from "fuse.js";
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Order from '../models/orderModel.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {

    const existingAdmin = await adminModel.findOne({ email });

    if (existingAdmin) {
      return res.json({ success: false, message: "Admin already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const admin = new adminModel({
      name,
      email,
      password: hashPassword,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 10 * 60 * 1000
    });

    await admin.save();

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: 'Your verification OTP for EduVerse',
      text: `Hello ${admin.name},\n\nYour OTP for email verification is: ${otp}\nThis OTP is valid for 10 minutes.\n\nThank you!\n`
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

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (!admin.isVerified) {
      return res.json({ success: false, needVerify: true, message: "Please verify your email first" });
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
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({ success: true, message: "Login successful", token, admin: { id: admin._id, name: admin.name, email: admin.email } });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const logout = async (req, res) => {
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

export const verifyOtpCheck = async (req, res) => {

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    if (admin.verifyOtp === '' || admin.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (admin.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    admin.verifyOtp = '';
    admin.verifyOtpExpireAt = 0;

    await admin.save();

    return res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const verifyAccount = async (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Missing email" });
  }

  try {
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    if (admin.isVerified) {
      return res.json({ success: false, message: "Admin already verified" });
    }

    admin.isVerified = true;
    await admin.save();

    return res.json({ success: true, message: "Account verified successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }
    if (!admin.isVerified) {
      return res.json({ success: false, message: "Account not verified" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.verifyOtp = otp;
    admin.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 phút
    await admin.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Password Reset OTP",
      text: `Hello ${admin.name},\n\nYour account recovery OTP is: ${otp}\nThis code is valid for 10 minutes.\n\nThank you!`
    });
    return res.json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {

    const { email, newPassword } = req.body;
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    if (!admin.isVerified) {
      return res.json({ success: false, message: "Account not verified" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;

    await admin.save();

    return res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await adminModel
      .findById(req.adminId)
      .select("name email isVerified isApproved createdAt updatedAt");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Admin profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin profile",
      error: error.message,
    });
  }
};

export const getAllAdministrators = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search?.trim() || "";

    const adminsDocs = await adminModel
      .find({}, 'name email isVerified isApproved createdAt updatedAt')
      .sort({ createdAt: -1 });

    const admins = adminsDocs.map((doc) => doc.toObject());

    // Nếu có từ khóa tìm kiếm, áp dụng fuzzy search
    let results = admins;
    if (search) {
      const fuse = new Fuse(admins, {
        keys: ["name", "email"],
        threshold: 0.4, // độ mờ (0 = chính xác, 1 = rất mờ)
        distance: 100,  // độ linh hoạt khi sai ký tự
        includeScore: true,
      });

      const fuzzyResults = fuse.search(search);
      results = fuzzyResults.map(r => r.item);
    }

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch administrators",
      error: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });

    const totalCourses = await Course.countDocuments();

    const salesData = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalSales = salesData[0]?.totalSales || 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalSales
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};

export const getEarningsChart = async (req, res) => {
  try {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const salesData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          monthlySales: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthLabels = [];
    const salesValues = [];
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

    let currentDate = new Date(twelveMonthsAgo);

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      monthLabels.push(`${monthFormatter.format(currentDate)} ${year}`);

      const foundMonth = salesData.find(d => d._id.year === year && d._id.month === month);
      salesValues.push(foundMonth ? foundMonth.monthlySales : 0);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({
      success: true,
      data: {
        series: [{ name: 'Earnings', data: salesValues }],
        categories: monthLabels
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings chart",
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.adminId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old and new passwords.' });
    }

const admin = await adminModel.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.password = hashedPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};