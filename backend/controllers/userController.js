import userModel from "../models/userModel.js";
import cloudinary, { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } from "../configs/cloudinary.js";
import bcrypt from 'bcryptjs';

// GET /user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
      .select("name email phonenumber bio website socials pfpImg isVerified role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};

// PATCH /user/profile
export const updateProfile = async (req, res) => {
  try {
    const { password, ...updates } = req.body; // prevent password from being updated here

    const user = await userModel
      .findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true })
      .select("name email phonenumber pfpImg bio website socials");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// #TODO: pending deletion
// DELETE /user/profile
export const deleteAccount = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User account deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /api/user/avatar/upload
export const generateAvatarUploadSignature = async (req, res) => {
  try {
    const userId = req.userId;

    // check user
    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      return res.status(403).json({
        success: false,
        message: "Permission not granted"
      });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    const public_id = `user_${userId}_avatar`;
    const folder = 'avatars';
    const transformation = 'w_500,h_500,c_fill,g_auto,f_auto,q_auto,d_av4_khpvlh';

    // generate signature
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder,
      public_id,
      overwrite: true,
      transformation: transformation
    }, process.env.CLOUDINARY_API_SECRET);

    return res.status(200).json({
      success: true,
      uploadData: {
        timestamp,
        folder,
        public_id,
        signature,
        transformation,
        apiKey: CLOUDINARY_API_KEY,
        cloudName: CLOUDINARY_CLOUD_NAME
      }
    });

  } catch (error) {
    console.error("Error generating upload avatar signature: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// GET /user/data
export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);

        if(!user) {
            return res.json({success: false, message: "User not found"});
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// PATCH /api/user/change-password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old and new passwords' });
    }

    const userExists = await userModel.findById(userId).select('+password');
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, userExists.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password not match' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    userExists.password = hashedPassword;
    await userExists.save();

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error("Change user password error:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    
    if (!Array.isArray(interests)) {
      return res.status(400).json({ success: false, message: "Interests must be an array" });
    }

    const user = await userModel.findByIdAndUpdate(
      req.userId, 
      { interests: interests },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: "Interests updated successfully",
      user 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};