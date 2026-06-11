import mongoose from 'mongoose';
import logger from '#utils/logger.js';

import Cart from '#modules/cart/cart.model.js';
import Course, { STATUS_ENUM } from '#modules/course/course.model.js';
import CourseProgress, { LECTURE_STATUS_ENUM } from '#modules/learning/course-progress.model.js';
import Curriculum from '#modules/course/curriculum.model.js';
import DraftVideo from '#modules/video/draft-video.model.js';
import Enrollment from '#modules/enrollment/enrollment.model.js';
import Instructor from '#modules/instructor/instructor.model.js';
import QuizProgress from '#modules/quiz/quiz-progress.model.js';
import Review from '#modules/review/review.model.js';
import Student from '#modules/student/student.model.js';
import User, { ROLE_ENUM } from '#modules/user/user.model.js';
import Wishlist from '#modules/wishlist/wishlist.model.js';


export const cleanupAndHealUserData = async () => {
  logger.debug("🚀 Starting Users Cleanup & Healing...");

  try {
    const users = await User.find({}, "_id role").lean();
    const userIds = users.map(u => u._id.toString());

    const collectionsToCheck = [
      { model: Instructor, field: "user", name: "Instructor Profiles" },
      { model: Student, field: "user", name: "Student Profiles" },
      { model: Cart, field: "user", name: "Carts" },
      { model: Wishlist, field: "user", name: "Wishlists" },
    ];

    for (const item of collectionsToCheck) {
      const orphans = await item.model.find({
        [item.field]: { $nin: userIds }
      }).select("_id").lean();

      if (orphans.length > 0) {
        const orphanIds = orphans.map(doc => doc._id);
        await item.model.deleteMany({ _id: { $in: orphanIds } });
        logger.debug(`✅ Deleted ${orphanIds.length} orphaned ${item.name}.`);
      }
    }

    let healedCount = 0;

    for (const user of users) {
      if (user.role === ROLE_ENUM.instructor) {
        const exists = await Instructor.exists({ user: user._id });
        if (!exists) {
          await Instructor.create({ user: user._id });
          healedCount++;
          logger.debug(`🛠️ Healed missing Instructor profile for user: ${user._id}`);
        }
      } else if (user.role === ROLE_ENUM.student) {
        const exists = await Student.exists({ user: user._id });
        if (!exists) {
          await Student.create({ user: user._id });
          healedCount++;
          logger.debug(`🛠️ Healed missing Student profile for user: ${user._id}`);
        }
        
        const cartExists = await Cart.exists({ user: user._id });
        if (!cartExists) {
          await Cart.create({ user: user._id, courses: [] });
          logger.debug(`🛒 Created missing Cart for student: ${user._id}`);
        }
      }
    }

    logger.debug(`🏁 Cleanup & Healing Users Finished. (Healed: ${healedCount})`);

  } catch (error) {
    logger.error("❌ User Data Sync Failed:", error);
  }
};

export const flagOrphanedVideosForCron = async () => {
  logger.debug("🚀 Starting Orphaned Video Flagging...");

  try {
    const [curriculums, courses] = await Promise.all([
      Curriculum.find({}, "sections pendingUpdate.data.sections").lean(),
      Course.find({}, "previewVideo pendingUpdate.data.previewVideo").lean()
    ]);

    const activeVideoIds = new Set();

    curriculums.forEach(curr => {
      const processSections = (sections) => {
        sections?.forEach(sec => {
          sec.lectures?.forEach(lec => {
            if (lec.videoId) activeVideoIds.add(lec.videoId);
          });
        });
      };
      processSections(curr.sections);
      processSections(curr.pendingUpdate?.data?.sections);
    });

    courses.forEach(course => {
      if (course.previewVideo) activeVideoIds.add(course.previewVideo);
      if (course.pendingUpdate?.data?.previewVideo) {
        activeVideoIds.add(course.pendingUpdate.data.previewVideo);
      }
    });

    const activeIdArray = Array.from(activeVideoIds);
    logger.debug(`Detected ${activeIdArray.length} active videos.`);

    const gracePeriod = new Date(Date.now() - 2 * 60 * 60 * 1000); 
    const scheduledExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await DraftVideo.updateMany(
      {
        videoId: { $nin: activeIdArray },
        expireAt: { $exists: false },
        createdAt: { $lt: gracePeriod }
      },
      {
        $set: { expireAt: scheduledExpiry }
      }
    );

    logger.debug(`✅ Flagged ${result.modifiedCount} orphaned videos for your Cron job.`);

  } catch (error) {
    logger.error("❌ Video Flagging Failed:", error);
  }
};

export const cleanupOrphanedCurriculums = async () => {
  logger.debug("🚀 Starting Orphaned Curriculum Cleanup...");

  try {
    const activeCourses = await Course.find({}, "_id").lean();
    const activeCourseIds = activeCourses.map(c => c._id.toString());

    const orphanedCurriculums = await Curriculum.find({
      courseId: { $nin: activeCourseIds }
    }).select("_id courseId").lean();

    if (orphanedCurriculums.length === 0) {
      logger.debug("✅ No orphaned curriculums found.");
      return;
    }

    logger.debug(`Found ${orphanedCurriculums.length} orphaned curriculums. Cleaning up...`);

    const deleteIds = orphanedCurriculums.map(curr => curr._id);
    const result = await Curriculum.deleteMany({
      _id: { $in: deleteIds }
    });

    logger.debug(`✅ Successfully deleted ${result.deletedCount} orphaned curriculum documents.`);

  } catch (error) {
    logger.error("❌ Curriculum Cleanup Failed:", error);
  }
};

export const syncAllCourseStats = async () => {
  logger.debug("🚀 Starting Course Stats Sync...");

  const courses = await Course.find({ isDeleted: false });
  logger.debug(`Found ${courses.length} courses to process.`);

  for (const course of courses) {
    try {
      const courseId = course._id;

      const curriculum = await Curriculum.findOne({ courseId }).lean();
      const sections = curriculum?.sections || [];
      const sectionsCount = sections.length;
      const lectures = sections.flatMap(s => s.lectures || []);
      const lecturesCount = lectures.length;
      const totalDuration = lectures.reduce((acc, lec) => acc + (Number(lec.duration) || 0), 0);

      const studentsEnrolled = await Enrollment.countDocuments({
        course: courseId,
        status: "active"
      });

      const reviews = await Review.find({ course: courseId, isDeleted: false }).lean();
      const ratingCount = reviews.length;
      const ratingTotal = reviews.reduce((acc, rev) => acc + rev.rating, 0);

      const stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(rev => {
        const r = Math.round(rev.rating);
        if (stars[r] !== undefined) stars[r]++;
      });

      await Course.updateOne(
        { _id: courseId },
        {
          $set: {
            sectionsCount,
            lecturesCount,
            duration: totalDuration,
            studentsEnrolled,
            rating: {
              count: ratingCount,
              total: ratingTotal,
              stars: stars
            }
          }
        }
      );
      logger.debug(`✅ Synced Stats for Course: ${course.title}`);
    } catch (err) {
      logger.error(`❌ Failed to sync course ${course._id}:`, err);
    }
  }

  logger.debug("🏁 Course Sync Finished.");
};

export const syncAllStudents = async () => {
  logger.debug("🚀 Starting Student Sync...");
  const students = await Student.find().select("user").lean();

  for (const student of students) {
    const userId = student.user;
    logger.debug(`Syncing Student: ${userId}`);

    const progressDocs = await CourseProgress.find({ user: userId }).lean();
    const courseIds = progressDocs.map((prog) => prog.course.toString());
    const courseMap = new Map(
      (await Course.find({ _id: { $in: courseIds } }).select("lecturesCount").lean())
        .map((course) => [course._id.toString(), course])
    );

    let totalLectures = 0;
    let completedLectures = 0;
    let completedCourses = 0;
    const totalCourses = progressDocs.length;

    for (const prog of progressDocs) {
      const totalInCourse = prog.lectures?.length || 0;
      const completedInCourse = prog.lectures?.filter(
        (l) => l.status === LECTURE_STATUS_ENUM.completed
      ).length || 0;

      const course = courseMap.get(prog.course.toString());
      const courseTotalLectures = course?.lecturesCount ?? totalInCourse;
      const isActuallyCompleted = courseTotalLectures > 0 && completedInCourse === courseTotalLectures;

      const needsProgressUpdate =
        prog.completedLecturesCount !== completedInCourse ||
        prog.totalLectures !== courseTotalLectures ||
        prog.isCompleted !== isActuallyCompleted;

      if (needsProgressUpdate) {
        await CourseProgress.updateOne(
          { _id: prog._id },
          {
            $set: {
              completedLecturesCount: completedInCourse,
              totalLectures: courseTotalLectures,
              isCompleted: isActuallyCompleted,
            },
          }
        );
      }

      totalLectures += courseTotalLectures;
      completedLectures += completedInCourse;
      if (isActuallyCompleted) completedCourses++;
    }

    await Student.updateOne(
      { user: userId },
      {
        $set: {
          "stats.totalCourses": totalCourses,
          "stats.completedCourses": completedCourses,
          "stats.totalLectures": totalLectures,
          "stats.completedLectures": completedLectures,
        },
      }
    );
  }

  logger.debug(`✅ Finished syncing ${students.length} students.`);
};

export const syncAllInstructors = async () => {
  logger.debug("🚀 Starting Instructor Sync...");

  const instructors = await Instructor.find({ isApproved: true })
    .select('user')
    .lean();

  logger.debug(`Found ${instructors.length} instructors to process.`);

  let successCount = 0;
  let failureCount = 0;

  for (const inst of instructors) {
    try {
      const userId = inst.user;

      const courses = await Course.find({
        "instructor.ref": userId,
        isDeleted: false,
      }).select('_id rating').lean();

      const courseIds = courses.map(c => c._id);

      const uniqueStudents = await Enrollment.distinct("student", {
        instructor: userId,
        status: "active"
      });

      const totalReviews = courses.reduce((acc, c) => acc + (c.rating?.count || 0), 0);
      const ratingSum = courses.reduce((acc, c) => acc + (c.rating?.total || 0), 0);

      await Instructor.updateOne(
        { user: userId },
        {
          $set: {
            myCourses: courseIds,
            "stats.totalCourses": courseIds.length,
            "stats.totalStudents": uniqueStudents.length,
            "stats.totalReviews": totalReviews,
            "stats.ratingSum": ratingSum,
          }
        }
      );

      successCount++;
      if (successCount % 10 === 0) logger.debug(`Processed ${successCount} instructors...`);

    } catch (error) {
      logger.error(`❌ Failed to sync instructor ${inst.user}:`, error.message);
      failureCount++;
    }
  }

  logger.debug(`🏁 Instructor Sync Finished. Success: ${successCount}. Failed: ${failureCount}`);
};