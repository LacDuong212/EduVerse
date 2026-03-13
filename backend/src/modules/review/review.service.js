import AppError from "#exceptions/app.error.js";
import { updateCourseRating } from "#modules/course/course.service.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import { getPaginationOptions } from "#utils/pagination.js";
import * as reviewMapper from "./review.mapper.js";
import Review from "./review.model.js";

export const createReview = async (stuId, reviewReq) => {
  if (!(await existsEnrollment(stuId, reviewReq.courseId)))
    throw new AppError("You cannot review a course that you haven't bought.", 403);

  const existsReview = await Review.findOne({
    user: stuId, course: reviewReq.courseId, isDeleted: false
  }).lean();
  if (existsReview)
    throw new AppError("You already reviewed this course.", 409);

  const newReview = await Review.create({
    user: stuId,
    course: reviewReq.courseId,
    rating: reviewReq.rating ?? 0,
    description: reviewReq.description ?? "",
    isDeleted: false,
  });

  await updateCourseRating(reviewReq.courseId, {
    newRating: newReview.rating,
    isNew: true,
  });

  return reviewMapper.toSimpleReviewDto(newReview);
};

export const updateReview = async (stuId, reviewId, reviewReq) => {
  const oldReview = await Review.findOne({
    _id: reviewId, user: stuId, isDeleted: false
  }).lean();
  if (!oldReview) throw new AppError("Review not found.", 404);

  const updatedReview = await Review.findOneAndUpdate(
    { _id: reviewId },
    { $set: reviewReq },
    { new: true, runValidators: true, lean: true }
  );

  if (reviewReq.rating && reviewReq.rating !== oldReview.rating) {
    await updateCourseRating(oldReview.course, {
      oldRating: oldReview.rating,
      newRating: reviewReq.rating,
      isNew: false,
      isDeleted: false,
    });
  }

  return reviewMapper.toSimpleReviewDto(updatedReview);
};

export const softDeleteReview = async (stuId, reviewId) => {
  const review = await Review.findOne({
    _id: reviewId, user: stuId, isDeleted: false
  }).lean();
  if (!review)
    throw new AppError("Review not found or already deleted.", 404);

  await Review.updateOne(
    { _id: reviewId },
    { $set: { isDeleted: true } }
  );

  await updateCourseRating(review.course, {
    oldRating: review.rating,
    isDeleted: true,
  });

  return true;
};

export const getPaginatedReviewsByCourseId = async (
  userId = null, courseId, { page = 1, limit = 5 }
) => {
  const { page: pageNum, limit: limitCount, skip } = getPaginationOptions(page, limit);

  let myReview = null;
  if (userId) {
    myReview = await Review.findOne({
      course: courseId,
      user: userId,
      isDeleted: false
    }).populate("user", "name pfpImg")
    .lean();
  }

  const query = {
    course: courseId,
    isDeleted: false,
    ...(myReview && { _id: { $ne: myReview._id } })
  };

  const [otherReviews, totalCount] = await Promise.all([
    Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitCount)
      .populate("user", "name pfpImg")
      .lean(),
    Review.countDocuments(query)
  ]);

  return {
    myReview: myReview ? reviewMapper.toCourseReviewDto(myReview) : undefined,
    reviews: otherReviews.map(r => reviewMapper.toCourseReviewDto(r)),
    total: totalCount,
    page: pageNum,
    limit: limitCount,
  };
};

export default {
  createReview,
  updateReview,
  softDeleteReview,
  getPaginatedReviewsByCourseId,
};