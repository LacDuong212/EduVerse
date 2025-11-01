import Course from "../models/courseModel.js";
import Order from "../models/orderModel.js";
import userInteraction from "../models/userInteraction.js";
import Fuse from "fuse.js";

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
    // query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || "").trim();
    const { category, subCategory } = req.query;

    // bộ lọc DB (lọc trước để giảm dữ liệu đưa vào fuzzy)
    const mongoFilter = {};
    if (category) mongoFilter.category = category;
    if (subCategory) mongoFilter.subCategory = subCategory;

    // lấy về mảng "thô" (lean) cho nhẹ và nhanh
    const courseDocs = await Course.find(mongoFilter, {
      // chọn các field cần thiết cho FE
      title: 1,
      subtitle: 1,
      category: 1,
      subCategory: 1,
      level: 1,
      thumbnail: 1,
      price: 1,
      discountPrice: 1,
      createdAt: 1,
      updatedAt: 1,
      // nếu có courseId khác _id
      courseId: 1,
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    // mặc định kết quả = toàn bộ sau khi lọc DB
    let results = courseDocs;

    // fuzzy search khi có search
    if (search) {
      const fuse = new Fuse(courseDocs, {
        keys: ["title", "subtitle", "category", "subCategory", "tags"],
        // tinh chỉnh fuzzy cho nội dung khóa học
        threshold: 0,          // 0 = khắt khe, 1 = rất thoáng
        distance: 120,            // chấp nhận độ lệch ký tự
        ignoreLocation: true,     // không phụ thuộc vị trí match
        includeScore: true,
        minMatchCharLength: 2,
      });

      const fuzzyResults = fuse.search(search);
      results = fuzzyResults.map((r) => r.item);
    }

    // phân trang sau fuzzy
    const total = results.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = results.slice(start, end);

    // Chuẩn hóa courseId cho FE nếu bạn đang dùng courseId riêng
    const data = paginated.map((c) => ({
      courseId: c.courseId || String(c._id), // FE của bạn đang dùng courseId
      title: c.title,
      subtitle: c.subtitle,
      category: c.category,
      subCategory: c.subCategory,
      level: c.level,
      thumbnail: c.thumbnail,
      price: c.price,
      discountPrice: c.discountPrice,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
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

export const courseViewed = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Kiểm tra khóa học có tồn tại
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Ghi nhận lượt xem
    await userInteraction.findOneAndUpdate(
      { userId, productId: id, interactionType: 'view' },
      { interactedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Course view recorded" });
  } catch (error) {
    console.error("Error recording course view:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getViewedCourses = async (req, res) => {
  try {
    const userId = req.userId; // từ middleware auth
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, subCategory, search } = req.query;

    // Lấy tất cả interactions 'view' của user
    const interactions = await userInteraction.find({
      userId,
      interactionType: 'view'
    }).sort({ interactedAt: -1 });

    // Lấy danh sách courseId
    let courseIds = interactions.map(i => i.productId);

    // Lọc course theo các query params
    const filter = { _id: { $in: courseIds } };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (search) filter.title = { $regex: search, $options: "i" };

    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      courses,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching viewed courses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
            _id: c._id,
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
export const getRelatedCourses = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm course hiện tại
    const currentCourse = await Course.findById(id);
    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Điều kiện tìm related
    const conditions = [
      { tags: { $in: currentCourse.tags || [] } },
      { category: currentCourse.category },
      { subCategory: currentCourse.subCategory }
    ];

    // Tìm tất cả course liên quan
    let relatedCourses = await Course.find({
      _id: { $ne: id },
      $or: conditions
    }).select("title thumbnail instructor studentsEnrolled rating price discountPrice ");

    // Loại bỏ trùng lặp (nếu có)
    const seen = new Set();
    relatedCourses = relatedCourses.filter(c => {
      if (seen.has(c._id.toString())) return false;
      seen.add(c._id.toString());
      return true;
    });

    res.json({
      success: true,
      courses: relatedCourses,
    });
  } catch (error) {
    console.error("Error in getRelatedCourses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }};
