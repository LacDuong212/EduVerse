import userModel from "../models/userModel.js";
import Fuse from "fuse.js";


export const getAllInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search?.trim() || "";

    const instructorDocs = await userModel
      .find(
        { role: 'instructor' },
        'name email isVerified isActivated createdAt updatedAt pfpImg'
      )
      .sort({ createdAt: -1 });

    const instructors = instructorDocs.map((doc) => doc.toObject());

    let results = instructors;
    if (search) {
      const fuse = new Fuse(instructors, {
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
      message: "Failed to fetch instructors",
      error: error.message,
    });
  }
};

// PATCH /user/instructors/:id/block
export const blockInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedInstructor = await userModel.findOneAndUpdate(
      { _id: id, role: 'instructor' },
      { isActivated: false },
      { new: true }
    );

    if (!updatedInstructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    res.json({ success: true, data: updatedInstructor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to block instructor",
      error: error.message,
    });
  }
};

// PATCH /user/instructors/:id/unblock
export const unblockInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedInstructor = await userModel.findOneAndUpdate(
      { _id: id, role: 'instructor' },
      { isActivated: true },
      { new: true }
    );

    if (!updatedInstructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    res.json({ success: true, data: updatedInstructor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unblock instructor",
      error: error.message,
    });
  }
};