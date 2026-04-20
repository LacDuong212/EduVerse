import Wishlist from "./wishlist.model.js";
import AppError from "#exceptions/app.error.js";

export const addToWishlist = async (userId, courseId) => {

  const exists = await Wishlist.exists({
    user: userId,
    course: courseId
  });

  if (exists) throw new AppError("Course already in wishlist", 409);

  const item = await Wishlist.create({
    user: userId,
    course: courseId
  });

  return item.populate({
    path: "course",
    populate: {
      path: "category",
      select: "name slug"
    }
  });
}

export const removeFromWishlist = async (userId, courseId) => {

  const deleted = await Wishlist.findOneAndDelete({
    user: userId,
    course: courseId
  });

  if (!deleted) throw new AppError("Course not found in wishlist", 404);

  return courseId;
}

export const getWishlist = async (userId) => {

  const list = await Wishlist.find({ user: userId })
    .populate({
      path: "course",
      populate: {
        path: "category",
        select: "name slug"
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  return list
    .filter(item => item.course)
    .map(item => item.course)
};

export const checkWishlist = async (userId, courseId) => {

  const exists = await Wishlist.exists({
    user: userId,
    course: courseId
  })

  return !!exists;
}

export const countWishlist = async (userId) => {
  return Wishlist.countDocuments({ user: userId });
}