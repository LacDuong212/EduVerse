// backend/helpers/recalculateCourseRating.js
import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Course from "../models/courseModel.js";

export async function recalculateCourseRating(courseId) {
  const stats = await Review.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        total: { $sum: "$rating" },
      },
    },
  ]);

  let count = 0;
  let total = 0;
  let average = 0;

  if (stats.length > 0) {
    count = stats[0].count || 0;
    total = stats[0].total || 0;
    average = count > 0 ? total / count : 0;
  }

  // clamp 0–5 cho chắc
  if (average < 0) average = 0;
  if (average > 5) average = 5;

  await Course.findByIdAndUpdate(
    courseId,
    {
      $set: {
        "rating.count": count,
        "rating.total": total,
        "rating.average": average,
      },
    },
    { new: true }
  );
}
