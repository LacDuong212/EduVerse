import AppError from "#exceptions/app.error.js";
import CourseProgress from "#modules/learning/course-progress.model.js";
import { generateCertId } from "./certificate.util.js";

// Public: fetch a certificate by its public id (no auth).
export const getCertificateByCertId = async (certId) => {
  const progress = await CourseProgress.findOne({ certId, isCompleted: true })
    .populate("user", "name")
    .populate("course", "title instructor");

  if (!progress) throw new AppError("Certificate not found.", 404);

  return progress;
};

// Protected: list all certificates of the current user (completed courses).
// Lazily mints certId for any completed course missing one, so every item is shareable.
export const listMyCertificates = async (userId) => {
  const items = await CourseProgress.find({ user: userId, isCompleted: true })
    .populate("course", "title thumbnail instructor")
    .sort({ certIssuedAt: -1, updatedAt: -1 });

  for (const item of items) {
    if (!item.certId) {
      item.certId = generateCertId();
      item.certIssuedAt = new Date();
      await item.save();
    }
  }

  return items;
};

// Protected: issue (or return existing) a certificate for the current user's
// completed course. Lazily mints certId for courses completed before this feature.
export const issueCertificate = async (userId, courseId) => {
  const progress = await CourseProgress.findOne({ user: userId, course: courseId })
    .populate("user", "name")
    .populate("course", "title instructor");

  if (!progress) throw new AppError("Progress record not found.", 404);
  if (!progress.isCompleted)
    throw new AppError("Course is not completed yet.", 400);

  if (!progress.certId) {
    progress.certId = generateCertId();
    progress.certIssuedAt = new Date();
    await progress.save();
  }

  return progress;
};
