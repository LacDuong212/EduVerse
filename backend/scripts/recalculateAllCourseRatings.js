// backend/scripts/recalculateAllCourseRatings.js
import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import { recalculateCourseRating } from "../helpers/recalculateCourseRating.js";

try {
  // 👇 dùng y chang kiểu bạn của bạn
  await mongoose.connect(`${process.env.MONGODB_URI}/eduverse`);
  console.log("✅ Connected to MongoDB");

  const courses = await Course.find({});
  console.log(`Found ${courses.length} courses. Recalculating...`);

  for (const course of courses) {
    await recalculateCourseRating(course._id);
  }

  console.log("🎉 Done recalculating ratings");
} catch (err) {
  console.error("❌ Error while recalculating ratings:", err);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
