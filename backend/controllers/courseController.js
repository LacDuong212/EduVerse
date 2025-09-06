import Course from "../models/courseModel.js";

export const getHomeCourses = async (req, res) => {
    try {
        const newest = await Course.find()
            .sort({ createdAt: -1 })
            .limit(8);
        
        const bestSellers = await Course.find()
            .sort({ studentsEnrolled: -1 })
            .limit(6);

        const topRated = await Course.find()
        .sort({ "rating.average": -1, "rating.count": -1 })
        .limit(8);

        const biggestDiscounts = await Course.aggregate([
          { $match: { discountPrice: { $ne: null } } },
          { $addFields: { discountAmount: { $subtract: ["$price", "$discountPrice"] } } },
          { $sort: { discountAmount: -1 } },
          { $limit: 4 }
        ]);

        res.json({
        newest,
        bestSellers,
        topRated,
        biggestDiscounts,
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching home courses", error });
    }
};

export const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const courses = await Course.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments();

    res.json({
      courses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};