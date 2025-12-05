// controllers/courseProgressController.js
import Course from "../models/courseModel.js";
import CourseProgress from "../models/courseProgressModel.js";
import LearningStreak from "../models/learningStreakModel.js"; 


// --- helpers ---
const countLecturesFromCurriculum = (cur = []) =>
  Array.isArray(cur)
    ? cur.reduce(
      (acc, sec) =>
        acc + (Array.isArray(sec?.lectures) ? sec.lectures.length : 0),
      0
    )
    : 0;

const getTotalLectures = (course) => {
  if (!course) return 0;
  if (typeof course.lecturesCount === "number") return course.lecturesCount;
  return countLecturesFromCurriculum(course.curriculum);
};

// GET /api/courses/:courseId/progress
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId; // giống các hàm khác trong courseController

    let progress = await CourseProgress.findOne({ userId, courseId });

    // chưa có progress => lấy info từ Course, trả skeleton
    if (!progress) {
      const course = await Course.findById(courseId).lean();
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      const totalLectures = getTotalLectures(course);

      return res.json({
        success: true,
        progress: {
          userId,
          courseId,
          totalLectures,
          completedLecturesCount: 0,
          totalTimeSpentSec: 0,
          lastLectureId: null,
          lastPositionSec: 0,
          lectures: [],
          percentage: 0,
        },
      });
    }

    const json = progress.toObject({ virtuals: true });

    return res.json({
      success: true,
      progress: json,
    });
  } catch (error) {
    console.error("getCourseProgress error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

// POST /api/courses/:courseId/progress/lectures/:lectureId
// body: { currentTimeSec, durationSec, isCompleted, deltaTimeSec }
export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.userId;

    const {
      currentTimeSec = 0,
      durationSec = 0,
      isCompleted = false,
      deltaTimeSec = 0,
      isNewSession = false,
      testDate,                // 👈 THÊM
    } = req.body || {};

    let progress = await CourseProgress.findOne({ userId, courseId });

    // nếu chưa có progress -> tạo mới
    if (!progress) {
      console.log("[updateLectureProgress] CREATE new course progress", {
        userId,
        courseId,
      });
      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      progress = new CourseProgress({
        userId,
        courseId,
        totalLectures: getTotalLectures(course),
        completedLecturesCount: 0,
        lectures: [],
        firstStartedAt: new Date(),
      });
    } else {
      console.log("[updateLectureProgress] UPDATE existing course progress", {
        userId,
        courseId,
        progressId: progress._id,
      });
    }

    // tìm lecture progress
    let lecture = progress.lectures.find(
      (l) => l.lectureId.toString() === lectureId.toString()
    );

    if (!lecture) {
      lecture = {
        lectureId,
        status: "in_progress",
        lastPositionSec: currentTimeSec,
        durationSec,
        viewCount: 1, // lần đầu
        totalTimeSpentSec: Math.max(0, deltaTimeSec || 0),
        lastActivityAt: new Date(),
      };
      progress.lectures.push(lecture);
    } else {
      lecture.lastPositionSec = currentTimeSec;
      if (durationSec) lecture.durationSec = durationSec;
      lecture.lastActivityAt = new Date();

      if (deltaTimeSec > 0) {
        lecture.totalTimeSpentSec =
          (lecture.totalTimeSpentSec || 0) + deltaTimeSec;
      }

      if (lecture.status === "not_started") {
        lecture.status = "in_progress";
      }

      // ✅ chỉ tăng nếu là session mới
      if (isNewSession) {
        lecture.viewCount = (lecture.viewCount || 0) + 1;
      }
    }

    if (isCompleted && lecture.status !== "completed") {
      lecture.status = "completed";
      lecture.completedAt = new Date();
      progress.completedLecturesCount += 1;

      // ⭐ DÙNG testDate nếu có (chỉ test)
      try {
        await LearningStreak.registerActivity(userId, testDate || new Date());
      } catch (streakErr) {
        console.error(
          "[updateLectureProgress] streak update error:",
          streakErr
        );
      }
    }
    
    // update tổng
    progress.lastLectureId = lectureId;
    progress.lastPositionSec = currentTimeSec;
    if (deltaTimeSec > 0) {
      progress.totalTimeSpentSec += deltaTimeSec;
    }
    progress.lastActivityAt = new Date();

    await progress.save();

    const json = progress.toObject({ virtuals: true });

    return res.json({
      success: true,
      progress: json,
    });
  } catch (error) {
    console.error("updateLectureProgress error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};