import bcrypt from 'bcryptjs';
import adminModel from '../models/adminModel.js';


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