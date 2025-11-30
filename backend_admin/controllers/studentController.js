import userModel from "../models/userModel.js";
import Fuse from "fuse.js";


export const getAllStudents  = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search?.trim() || "";

    const studentsDocs = await userModel
      .find({role : 'student'}, 'name email isVerified isActivated createdAt updatedAt pfpImg')
      .sort({ createdAt: -1 });

    const students = studentsDocs.map((doc) => doc.toObject());

    let results = students;
    if (search) {
      const fuse = new Fuse(students, {
        keys: ["name", "email"],
        threshold: 0.4,
        distance: 100,
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