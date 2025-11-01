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
};export const getAllCourses = async (req, res) => {
  try {
    // query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || "").trim();
    const { category, subCategory } = req.query;

    // bộ lọc DB
    const mongoFilter = {};
    if (category) mongoFilter.category = category;
    if (subCategory) mongoFilter.subCategory = subCategory;

    // chỉ lấy field cần thiết cho FE + tính toán
    const courseDocs = await Course.find(mongoFilter, {
      title: 1,
      subtitle: 1,
      description: 1, // nếu cần cho FE
      image: 1,       // nếu cần cho FE
      category: 1,
      subCategory: 1,
      language: 1,

      // instructor (đúng theo schema bạn cung cấp)
      "instructor.ref": 1,
      "instructor.name": 1,
      "instructor.avatar": 1,

      level: 1,
      duration: 1,
      lecturesCount: 1,

      curriculum: 1, // lấy để fallback (nếu muốn nhẹ hơn thì chỉ chọn trường cần như dưới)
      // "curriculum.section": 1,
      // "curriculum.lectures.duration": 1,

      studentsEnrolled: 1,

      rating: 1,

      thumbnail: 1,
      previewVideo: 1,
      tags: 1,

      price: 1,
      discountPrice: 1,

      isActive: 1,
      status: 1,

      createdAt: 1,
      updatedAt: 1,
      courseId: 1,
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    let results = courseDocs;

    // fuzzy search (nếu có từ khoá)
    if (search) {
      // đảm bảo đã cài và import Fuse
      const fuse = new Fuse(courseDocs, {
        keys: ["title", "subtitle", "category", "subCategory", "tags"],
        threshold: 0,           // strict match (giống logic bạn đang dùng)
        distance: 120,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      });
      results = fuse.search(search).map((r) => r.item);
    }

    // phân trang SAU fuzzy (giữ nguyên logic quan trọng)
    const total = results.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = results.slice(start, end);

    // helper fallback
    const sumLectureDurations = (cur = []) =>
      Array.isArray(cur)
        ? cur.reduce((acc, sec) => {
            const list = Array.isArray(sec?.lectures) ? sec.lectures : [];
            const s = list.reduce((a, lec) => a + (Number(lec?.duration) || 0), 0);
            return acc + s;
          }, 0)
        : 0;

    const countLecturesFromCurriculum = (cur = []) =>
      Array.isArray(cur)
        ? cur.reduce(
            (acc, sec) => acc + (Array.isArray(sec?.lectures) ? sec.lectures.length : 0),
            0
          )
        : 0;

    // Chuẩn hoá dữ liệu phản hồi
    const data = paginated.map((c) => {
      // duration (giờ)
      const duration =
        typeof c.duration === "number" && !Number.isNaN(c.duration)
          ? c.duration
          : sumLectureDurations(c.curriculum);

      // lectures (số bài)
      const lectures =
        typeof c.lecturesCount === "number" && !Number.isNaN(c.lecturesCount)
          ? c.lecturesCount
          : countLecturesFromCurriculum(c.curriculum);

      // rating object (giữ nguyên)
      const rating = {
        average: Number(c?.rating?.average ?? 0),
        count: Number(c?.rating?.count ?? 0),
        total: Number(c?.rating?.total ?? 0),
      };

      // studentsEnrolled: ưu tiên field trong DB, fallback từ rating.count
      const studentsEnrolled = Number.isFinite(Number(c?.studentsEnrolled))
        ? Number(c.studentsEnrolled)
        : (Number.isFinite(Number(c?.rating?.count)) ? Number(c.rating.count) : 0);

      // instructor: map đúng theo schema (không dùng populate để không đổi logic quan trọng)
      const instructor = c?.instructor
        ? {
            ref: c.instructor.ref,     // ObjectId
            name: c.instructor.name,   // có thể null nếu chưa set
            avatar: c.instructor.avatar,
          }
        : undefined;

      return {
        courseId: c.courseId || String(c._id),

        // các field FE cần
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

        // số liệu chuẩn hoá
        rating,
        duration,
        lectures,

        // ➕ field mới thêm theo yêu cầu
        studentsEnrolled,
        instructor,
      };
    });

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
