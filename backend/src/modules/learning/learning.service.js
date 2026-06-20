import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import Curriculum from "#modules/course/curriculum.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import QuizProgress from "#modules/quiz/quiz-progress.model.js";
import User from "#modules/user/user.model.js";
import { updateStreak } from "#modules/streak/streak.service.js";
import { evaluateAndAward } from "#modules/badge/badge.evaluator.js";
import Student from "#modules/student/student.model.js";
import { withTransaction } from "#utils/transaction.js";
import CourseProgress, { LECTURE_STATUS_ENUM as LECTURE_STATUS } from "./course-progress.model.js";
import { toCourseProgressDto } from "./progress.mapper.js";

export const getResumeCardData = async (userId) => {
  const progress = await CourseProgress.findOne({
    user: userId,
    isCompleted: false,
    lastActivityAt: { $exists: true, $ne: null },
  })
    .sort({ lastActivityAt: -1 })
    .populate({ path: "course", select: "title image thumbnail" })
    .lean();

  if (!progress || !progress.course) return null;

  const curriculum = await Curriculum.findOne({ courseId: progress.course._id })
    .select("sections.title sections.lectures._id sections.lectures.title")
    .lean();

  let lectureId = progress.lastLectureId?.toString() ?? null;
  let lectureTitle = null;

  // Find title of the last accessed lecture
  if (lectureId && curriculum) {
    outer:
    for (const section of curriculum.sections ?? []) {
      for (const lec of section.lectures ?? []) {
        if (lec._id?.toString() === lectureId) {
          lectureTitle = lec.title;
          break outer;
        }
      }
    }
  }

  // Fallback: first uncompleted lecture when lastLectureId is absent or deleted
  if (!lectureTitle && curriculum) {
    const completedIds = new Set(
      (progress.lectures ?? [])
        .filter((l) => l.status === LECTURE_STATUS.completed)
        .map((l) => l.lectureId?.toString())
    );
    outer:
    for (const section of curriculum.sections ?? []) {
      for (const lec of section.lectures ?? []) {
        const id = lec._id?.toString();
        if (!completedIds.has(id)) {
          lectureId    = id;
          lectureTitle = lec.title;
          break outer;
        }
      }
    }
  }

  const percentage = progress.totalLectures
    ? Math.round((progress.completedLecturesCount / progress.totalLectures) * 100)
    : 0;

  return {
    courseId:          progress.course._id?.toString(),
    courseTitle:       progress.course.title,
    thumbnail:         progress.course.thumbnail || progress.course.image || null,
    lectureId,
    lectureTitle,
    percentage,
    completedLectures: progress.completedLecturesCount ?? 0,
    totalLectures:     progress.totalLectures ?? 0,
    lastActivityAt:    progress.lastActivityAt,
  };
};

export const getLastLearningProgress = async (userId) => {
  const progress = await CourseProgress.findOne({ user: userId })
    .sort({ lastActivityAt: -1 })
    .populate({
      path: "course",
      select: "title curriculum _id",
    });

  if (!progress) return null;

  return {
    courseId: progress.course?._id,
    courseTitle: progress.course?.title,
    curriculum: progress.course?.curriculum,
    lastLectureId: progress.lastLectureId,
    completedCount: progress.completedLecturesCount,
  };
};

export const countInProgressCourses = async (userId) => {
  return await CourseProgress.countDocuments({
    user: userId,
    isCompleted: false,
    completedLecturesCount: { $gt: 0 }
  });
};

export const getCourseProgress = async (stuId, courseId) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);

  const isEnrolled = await existsEnrollment(stuId, courseId);
  if (!isEnrolled)
    throw new AppError("You haven't enrolled this course yet!", 403);

  let progress = await CourseProgress.findOne({ user: stuId, course: courseId })
    .populate("course", "status");

  if (!progress) {
    progress = await CourseProgress.create({ user: stuId, course: courseId });
    await progress.populate("course", "status");
  }

  if (!progress.course)
    throw new AppError("Course not found or no progress saved.", 404);

  if (progress.course?.status !== COURSE_STATUS.live)
    throw new AppError("Course is currently unvailable. Please try again later!", 404);

  return toCourseProgressDto(progress);
};

export const getStudentCourseProgress = async (insId, stuId, courseId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);
  if (!stuId) throw new AppError("Student ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false }).lean();
  if (!course) throw new AppError("Course not found.", 404);
  if (course.instructor?.ref?.toString() !== insId)
    throw new AppError("You don't have access to this course.", 403);
  if (course.status !== COURSE_STATUS.live)
    throw new AppError("Course is currently unavailable. Please try again later!", 404);

  const enrollment = await Enrollment.findOne({
    student: stuId,
    course: courseId,
    status: ENROLL_STATUS.active,
  }).lean();
  if (!enrollment)
    throw new AppError("Student is not enrolled in this course.", 403);

  const student = await User.findById(stuId)
    .select("name email pfpImg")
    .lean();
  if (!student) throw new AppError("Student not found.", 404);

  const [progress, quizProgress, curriculum] = await Promise.all([
    CourseProgress.findOne({ user: stuId, course: courseId }).lean(),
    QuizProgress.findOne({ user: stuId, course: courseId }).lean(),
    Curriculum.findOne({ courseId }).select("sections").lean(),
  ]);

  const lectureProgressMap = new Map();
  if (Array.isArray(progress?.lectures)) {
    progress.lectures.forEach((item) => {
      const lectureId = item.lectureId?.toString();
      if (!lectureId) return;

      let lectureProgress = 0;
      if (item.status === LECTURE_STATUS.completed) {
        lectureProgress = 100;
      } else if (item.durationSec > 0) {
        lectureProgress = Math.min(
          100,
          Math.round((item.lastPositionSec / item.durationSec) * 100)
        );
      }

      lectureProgressMap.set(lectureId, lectureProgress);
    });
  }

  const quizMap = new Map();
  if (Array.isArray(quizProgress?.quizzes)) {
    quizProgress.quizzes.forEach((quiz) => {
      const lectureId = quiz.lectureId?.toString();
      if (!lectureId) return;

      quizMap.set(lectureId, {
        totalQuestions: quiz.totalQuestions || 0,
        correctAnswers: Math.max(
          0,
          (quiz.totalQuestions || 0) - (Array.isArray(quiz.wrongAnswers) ? quiz.wrongAnswers.length : 0)
        ),
      });
    });
  }

  const sections = (curriculum?.sections || []).map((section) => ({
    secId: section._id?.toString(),
    title: section.title,
    lectures: (section.lectures || []).map((lecture) => {
      const lectureId = lecture._id?.toString() || lecture.lecId?.toString();
      const progressValue = lectureProgressMap.get(lectureId) ?? 0;
      const quizData = lectureId ? quizMap.get(lectureId) : null;

      return {
        lecId: lectureId,
        title: lecture.title,
        progress: progressValue,
        quiz: {
          isCompleted: Boolean(quizData),
          correctAnswersCount: quizData?.correctAnswers || 0,
          totalQuestionsCount: quizData?.totalQuestions || 0,
        },
      };
    }),
  }));

  const totalLectures = sections.reduce(
    (count, section) => count + (section.lectures?.length || 0),
    0
  );

  const totalQuizzes = (curriculum?.sections || []).reduce((count, section) => {
    if (!Array.isArray(section?.lectures)) return count;

    return count + section.lectures.reduce((lectureCount, lecture) => {
      const hasQuiz = lecture?.aiData?.quizzes?.length > 0;

      return hasQuiz ? lectureCount + 1 : lectureCount;
    }, 0);
  }, 0);

  const lectureCompleted = sections.reduce((count, section) => {
    return (
      count +
      (Array.isArray(section.lectures)
        ? section.lectures.reduce(
          (lectureCount, lecture) => (lecture?.progress === 100 ? lectureCount + 1 : lectureCount),
          0
        )
        : 0)
    );
  }, 0);

  const quizzCleared = Array.isArray(quizProgress?.quizzes)
    ? quizProgress.quizzes.length
    : 0;

  const totalQuizQuestions = sections.reduce((count, section) => {
    return (
      count +
      (Array.isArray(section.lectures)
        ? section.lectures.reduce(
          (sum, lecture) => sum + (lecture?.quiz?.totalQuestionsCount || 0),
          0
        )
        : 0)
    );
  }, 0);

  const totalCorrectAnswers = sections.reduce((count, section) => {
    return (
      count +
      (Array.isArray(section.lectures)
        ? section.lectures.reduce(
          (sum, lecture) => sum + (lecture?.quiz?.correctAnswersCount || 0),
          0
        )
        : 0)
    );
  }, 0);

  const quizAccuracy = totalQuizQuestions > 0
    ? Math.round((totalCorrectAnswers / totalQuizQuestions) * 100)
    : 0;

  const courseProgress = totalLectures > 0
    ? Math.round((lectureCompleted / totalLectures) * 100)
    : 0;

  return {
    student: {
      stuId: student._id?.toString(),
      name: student.name,
      email: student.email,
      avatar: student.pfpImg || null,
    },
    courseProgress: {
      sections,
      totalLectures,
      totalQuizzes,
      lectureCompleted,
      courseProgress,
      quizzCleared,
      quizAccuracy,
    },
  };
};

export const completeLecture = async (userId, courseId, lecId) => {
  // Flags captured inside the transaction so badge evaluation can run after it commits.
  let lectureJustCompleted = false;
  let courseJustCompleted = false;
  let capturedFirstStartedAt = null;
  let capturedAiScore = null;

  const result = await withTransaction(async (s) => {
    const progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    }).session(s);

    if (!progress) throw new AppError("Progress record not found.", 404);

    const lecture = progress.lectures.find(
      (l) => l.lectureId?.toString() === lecId.toString()
    );

    if (!lecture) throw new AppError("Lecture not found.", 404);

    if (lecture.status !== LECTURE_STATUS.completed) {
      lecture.status = LECTURE_STATUS.completed;
      lecture.completedAt = new Date();
      lecture.lastActivityAt = new Date();

      if (lecture.durationSec > 0) {
        lecture.lastPositionSec = lecture.durationSec;
      }

      progress.completedLecturesCount += 1;
      progress.lastLectureId = new mongoose.Types.ObjectId(lecId);
      progress.lastPositionSec = lecture.lastPositionSec || 0;
      progress.lastActivityAt = new Date();

      await Student.updateOne(
        { user: userId },
        { $inc: { "stats.completedLectures": 1 } },
        { session: s }
      );

      lectureJustCompleted = true;
    }

    if (
      !progress.isCompleted &&
      progress.completedLecturesCount >= progress.totalLectures
    ) {
      progress.isCompleted = true;
      progress.lastActivityAt = new Date();

      await Student.updateOne(
        { user: userId },
        { $inc: { "stats.completedCourses": 1 } },
        { session: s }
      );

      courseJustCompleted = true;
      capturedFirstStartedAt = progress.firstStartedAt ?? null;
      capturedAiScore = progress.aiAssessment?.overallScore ?? null;
    }

    await updateStreak(userId);
    await progress.save({ session: s });

    return toCourseProgressDto(progress);
  });

  // Badge evaluation runs after the transaction commits so it reads the final
  // incremented stats. Wrapped in try/catch — badge failure must not surface to
  // the API consumer or roll back the completed lecture.
  if (lectureJustCompleted || courseJustCompleted) {
    try {
      const student = await Student.findOne({ user: userId }).select("stats").lean();

      if (lectureJustCompleted) {
        await evaluateAndAward(userId, "lecture_completed", {
          lecturesTotal: student?.stats?.completedLectures ?? 0,
        });
      }

      if (courseJustCompleted) {
        const daysSinceFirst =
          capturedFirstStartedAt instanceof Date
            ? Math.floor((Date.now() - capturedFirstStartedAt.getTime()) / 86_400_000)
            : null;

        await evaluateAndAward(userId, "course_completed", {
          coursesTotal:          student?.stats?.completedCourses ?? 0,
          aiScore:               capturedAiScore,
          daysSinceFirstLecture: daysSinceFirst,
        });
      }
    } catch { /* badge failure must not break lecture completion */ }
  }

  return result;
};

export const syncLectureProgress = async (userId, courseId, lecId, data) => {
  const {
    currentTimeSec = 0,
    durationSec = 0,
    deltaTimeSec = 0,
    isNewSession = false,
  } = data;

  const now = new Date();
  const safeCurrentTime = Math.max(0, Number(currentTimeSec) || 0);
  const safeDuration = Math.max(0, Number(durationSec) || 0);
  const safeDelta = Math.max(0, Number(deltaTimeSec) || 0);

  let progress = await CourseProgress.findOneAndUpdate(
    {
      user: userId,
      course: courseId,
      "lectures.lectureId": lecId,
    },
    {
      $set: {
        "lectures.$.lastPositionSec": safeCurrentTime,
        "lectures.$.durationSec": safeDuration,
        "lectures.$.lastActivityAt": now,
        "lectures.$.status": LECTURE_STATUS.in_progress,
        lastLectureId: new mongoose.Types.ObjectId(lecId),
        lastPositionSec: safeCurrentTime,
        lastActivityAt: now,
      },
      $inc: {
        "lectures.$.totalTimeSpentSec": safeDelta,
        "lectures.$.viewCount": isNewSession ? 1 : 0,
        totalTimeSpentSec: safeDelta,
      },
    },
    { new: true }
  );

  if (!progress) {
    progress = await CourseProgress.findOneAndUpdate(
      {
        user: userId,
        course: courseId,
      },
      {
        $push: {
          lectures: {
            lectureId: new mongoose.Types.ObjectId(lecId),
            status: LECTURE_STATUS.in_progress,
            lastPositionSec: safeCurrentTime,
            durationSec: safeDuration,
            viewCount: isNewSession ? 1 : 0,
            totalTimeSpentSec: safeDelta,
            lastActivityAt: now,
          },
        },
        $set: {
          lastLectureId: new mongoose.Types.ObjectId(lecId),
          lastPositionSec: safeCurrentTime,
          lastActivityAt: now,
          firstStartedAt: now,
        },
        $inc: {
          totalTimeSpentSec: safeDelta,
        },
        $setOnInsert: {
          user: new mongoose.Types.ObjectId(userId),
          course: new mongoose.Types.ObjectId(courseId)
        },
      },
      { new: true, upsert: true }
    );
  }

  if (!progress) {
    throw new AppError("Progress record not found.", 404);
  }

  return toCourseProgressDto(progress);
};