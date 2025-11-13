import Student from "../models/studentModel.js";
import Order from "../models/orderModel.js"; // chỉ import model, KHÔNG sửa OrderController

/**
 * Helper: đảm bảo user có Student profile
 * - Nếu chưa có thì tạo mới
 */
const ensureStudentProfile = async (userId) => {
  if (!userId) return null;

  let student = await Student.findOne({ user: userId });

  if (!student) {
    student = await Student.create({
      user: userId,
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
      },
      myCourses: [],
      address: "",
    });
  }

  return student;
};

/**
 * GET /api/students/my-courses
 * - KHÔNG paging, KHÔNG search, KHÔNG sort
 * - Dữ liệu nguồn: các Order status = "completed" của user
 * - Sync sang Student.myCourses + stats rồi trả về
 */
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.userId; // từ middleware userAuth
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: no userId" });
    }

    // 1) Đảm bảo có profile Student
    let student = await ensureStudentProfile(userId);

    // 2) Lấy tất cả orders completed của user
    const orders = await Order.find({
      user: userId,
      status: "completed",
    }).populate("courses.course");

    // 3) Từ orders → gom unique courseId
    const existingSet = new Set(
      (student.myCourses || []).map((mc) => String(mc.course))
    );

    let added = 0;
    for (const order of orders) {
      for (const item of order.courses || []) {
        const c = item?.course;
        if (!c?._id) continue;
        const id = String(c._id);
        if (!existingSet.has(id)) {
          student.myCourses.push({ course: c._id });
          existingSet.add(id);
          added++;
        }
      }
    }

    // 4) Cập nhật stats nếu có course mới
    if (added > 0) {
      student.stats.totalCourses = student.myCourses.length;
      await student.save();
    }

    // 5) Lấy lại student với populate để trả về cho FE
    const populatedStudent = await Student.findOne({ user: userId })
      .select("myCourses stats")
      .populate({
        path: "myCourses.course",
        select:
          "_id title thumbnail lecturesCount totalLectures previewVideo price level studentsEnrolled createdAt description curriculum",
      })
      .lean();

    const coursesRaw =
      populatedStudent?.myCourses
        ?.map((mc) => mc.course)
        .filter(Boolean) || [];

    // 6) Chuẩn hoá course cho FE (gần giống API cũ)
    const courses = coursesRaw.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      lecturesCount: c.lecturesCount ?? c.totalLectures ?? 0,
      studentsEnrolled: c.studentsEnrolled ?? 0,
      level: c.level ?? null,
      price: c.price ?? 0,
      previewVideo: c.previewVideo ?? null,
      curriculum: c.curriculum ?? [],
      createdAt: c.createdAt,
    }));

    const totalCourses =
      populatedStudent.stats?.totalCourses ?? courses.length;
    const completedCourses = populatedStudent.stats?.completedCourses ?? 0;
    const inProgressCourses = Math.max(0, totalCourses - completedCourses);

    return res.status(200).json({
      success: true,
      courses,
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLessons: populatedStudent.stats?.totalLessons ?? 0,
        completedLessons: populatedStudent.stats?.completedLessons ?? 0,
      },
    });
  } catch (error) {
    console.error("getMyCourses error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching my courses",
      error: error?.message || error,
    });
  }
};
