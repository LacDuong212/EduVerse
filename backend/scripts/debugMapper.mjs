import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/config/database.js";
import { toEnrolledCourseRowDto } from "../src/modules/enrollment/enrollment.mapper.js";
import Enrollment from "../src/modules/enrollment/enrollment.model.js";

await connectDB();
const docs = await Enrollment.aggregate([
  { $match: { student: new mongoose.Types.ObjectId("694d32d7ebe694fc49e59a67"), status: "active" } },
  { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "course" } },
  { $unwind: "$course" },
  { $lookup: { from: "courseprogresses", let: { userId: "$student", courseId: "$course._id" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$user", "$$userId"] }, { $eq: ["$course", "$$courseId"] }] } } }], as: "progress" } },
  { $unwind: { path: "$progress", preserveNullAndEmptyArrays: true } },
  { $project: { _id: "$course._id", title: "$course.title", image: "$course.image", thumbnail: "$course.thumbnail", enrolledAt: 1, totalLectures: { $ifNull: ["$progress.totalLectures", 0] }, completedLectures: { $ifNull: ["$progress.completedLecturesCount", 0] }, lastActivityAt: { $ifNull: ["$progress.lastActivityAt", "$enrolledAt"] } } },
  { $limit: 2 }
]);
const mapped = docs.map(d => toEnrolledCourseRowDto(d));
console.log(JSON.stringify({ raw: docs[0], expectedDto: mapped[0] }, null, 2));
process.exit(0);
