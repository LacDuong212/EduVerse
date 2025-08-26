import userModel from "../models/userModel.js";

// GET /users/profile
export const getProfile = async (req, res) => {
  // req.userId is set by userAuth middleware in userRouters
  try {
    const user = await userModel.findById(req.userId).select("name email isVerified");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// PATCH /users/profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Never allow password updates here (make a separate endpoint for password change)
    delete updates.password;

    const user = await userModel.findByIdAndUpdate(req.userId, updates, { new: true }).select("name email isVerified");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User profile updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE /users/profile
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