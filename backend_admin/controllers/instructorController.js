import userModel from "../models/userModel.js";
import instructorModel from "../models/instructorModel.js";
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

// GET api/instructors/requests
export const getInstructorRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search?.trim() || "";

    const pendingDocs = await instructorModel
      .find({ isApproved: false })
      .populate('user', 'name email pfpImg')
      .sort({ createdAt: -1 });

    let formattedRequests = pendingDocs
      .filter(doc => doc.user)
      .map((doc) => {
        const obj = doc.toObject();
        return {
          _id: obj._id,
          name: obj.user.name,
          email: obj.user.email,
          pfpImg: obj.user.pfpImg,
          createdAt: obj.createdAt,
        };
      });

    let results = formattedRequests;

    // Search logic
    if (search) {
      const fuse = new Fuse(formattedRequests, {
        keys: ["name", "email"],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
      });

      const fuzzyResults = fuse.search(search);
      results = fuzzyResults.map((r) => r.item);
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
      message: "Failed to fetch instructor requests",
      error: error.message,
    });
  }
};

// PATCH api/instructors/:id/block
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

// PATCH api/instructors/:id/unblock
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

export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await instructorModel.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    await userModel.findByIdAndUpdate(instructor.user, { role: 'instructor' });

    try {
      const userId = String(instructor.user?._id || instructor.user);

      await axios.post('http://localhost:5000/api/internal/notify', {
        userId: userId,
        type: 'APPROVED',
        message: 'Congratulations! Your instructor application has been approved. You can now create courses.'
      });
      console.log(`[AdminBE] Instructor Approved Noti sent to User: ${userId}`);

    } catch (notifyError) {
      console.error('[AdminBE] Failed to send notification:', notifyError.message);
    }

    res.json({
      success: true,
      message: "Approved successfully",
      data: { _id: id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve", error: error.message });
  }
};

// DELETE api/instructors/:id/reject
export const rejectInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRequest = await instructorModel.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    try {
      const userId = String(deletedRequest.user?._id || deletedRequest.user);

      await axios.post('http://localhost:5000/api/internal/notify', {
        userId: userId,
        type: 'REJECTED',
        message: 'We are sorry, but your instructor application has been rejected. Please contact support for more details.'
      });
      console.log(`[AdminBE] Instructor Rejected Noti sent to User: ${userId}`);

    } catch (notifyError) {
      console.error('[AdminBE] Failed to send notification:', notifyError.message);
    }

    res.json({
      success: true,
      message: "Request rejected and deleted",
      data: { _id: id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject", error: error.message });
  }
};