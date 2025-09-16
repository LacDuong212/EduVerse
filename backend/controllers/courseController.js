import Course from "../models/courseModel.js";
import Order from "../models/orderModel.js";

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, subCategory, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      courses,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching courses", 
      error: error.message 
    });
  }
};


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

// GET /my-courses
export const getOwnedCourses = async (req, res) => {
  try {
    // get only completed orders
    const orders = await Order.find({
      user: req.userId,
      status: "completed"
    }).populate("courses.course");

    // extract unique courses (optional, cus pretteh sure no duplicates, unless..)
    const ownedCourses = [];
    const courseSet = new Set();
    for (const order of orders) {
      for (const item of order.courses) {
        const c = item.course;
        if (c && !courseSet.has(c._id.toString())) {
          courseSet.add(c._id.toString());

          ownedCourses.push({
            courseId: c._id,
            title: c.title,
            category: c.category,
            subCategory: c.subCategory,
            rating: c.rating,
            instructor: c.instructor,
            level: c.level,
            thumbnail: c.thumbnail,
            price: c.price,
            discountPrice: c.discountPrice,
            updatedAt: c.updatedAt,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      courses: ownedCourses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching owned courses", error });
  }
};
