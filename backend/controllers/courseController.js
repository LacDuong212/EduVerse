import Course from "../models/courseModel.js";

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
