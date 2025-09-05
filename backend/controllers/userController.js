import userModel from "../models/userModel.js";

// GET /user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
      .select("name email phonenumber bio website socials isVerified");

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
      .select("name email phonenumber bio website socials isVerified");

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