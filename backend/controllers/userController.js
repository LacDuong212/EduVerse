import userModel from "../models/userModel.js";
import {} from "../configs/cloudinary.js";
import fs from "fs";
import Fuse from "fuse.js";


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

// POST /user/avatar
export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.userId; // comes from auth middleware
    //const result = await uploadAvatar(req.file.path, userId); // upload to cloudinary

    // update DB with new avatar URL
    await userModel.findByIdAndUpdate(userId, { pfpImg: result.secure_url });

    // cleanup temp file after upload (multer stuff)
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Temp file cleanup failed:", err);
    });

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: result.secure_url,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: "Error uploading avatar" });
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

export const getAllStudents  = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search?.trim() || "";

    const studentsDocs = await userModel
      .find({role : 'student'}, 'name email isVerified isActivated createdAt updatedAt pfpImg')
      .sort({ createdAt: -1 });

    const students = studentsDocs.map((doc) => doc.toObject());

     // Nếu có từ khóa tìm kiếm, áp dụng fuzzy search
    let results = students;
    if (search) {
      const fuse = new Fuse(students, {
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
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// PATCH /user/students/:id/block
export const blockStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = await userModel.findByIdAndUpdate(
      id,
      { isActivated: false },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to block student",
      error: error.message,
    });
  }
};

// PATCH /user/students/:id/unblock
export const unblockStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = await userModel.findByIdAndUpdate(
      id,
      { isActivated: true },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unblock student",
      error: error.message,
    });
  }
};

// DELETE /user/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await userModel.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
};