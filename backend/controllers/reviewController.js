import Review from "../models/reviewModel.js";
import Course from "../models/courseModel.js";


// GET /reviews/:courseId?page=&limit=
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 1;
    const skip = (page - 1) * limit || 10;  // default 10 reviews/page

    // find user's reviews
    let userReviews = [];
    if (userId) {
      userReviews = await Review.find({
        course: courseId,
        user: userId,
        isDeleted: false
      }).sort({ createdAt: -1 });
    }

    // find others' reviews
    const query = { course: courseId, isDeleted: false };
    if (userId) query.user = { $ne: userId }; // exlcude user's id

    const reviewCount = await Review.countDocuments(query);
    const othersReviews = await Review.find(query)
      .populate("user", "name pfpImg")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true, 
      userReviews, 
      othersReviews, 
      pagination: { 
        reviewCount, 
        page, 
        pages: Math.ceil(reviewCount / limit) 
      }
    });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reviews", error });
  }
};

// POST /reviews/
export const createReview = async (req, res) => {
  try {
    const { courseId, rating, description } = req.body;
    const userId = req.userId;

    // check if course exist
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const review = new Review({
      course: courseId,
      user: userId,
      rating,
      description
    });
    await review.save();

    res.status(200).json({ success: true, message: "Review created", review });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error creating review", error })
  }
};

// PATCH /reviews/:reviewId
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, description } = req.body;
    const userId = req.userId;

    // check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found" });
    }

    // check if owner
    if (review.user.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not your review" });
    }

    review.rating = rating ?? review.rating;
    review.description = description ?? review.description;
    await review.save();

    res.status(200).json({ success: true, message: "Review updated", review });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error updating review", error });
  }
};

// DELETE /reviews/:reviewId
export const removeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    // check if exist
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // check if owner, #TODO: admins remove reviews?
    if (review.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not your review" });
    }

    review.isDeleted = true;
    await review.save();

    res.status(200).json({ success: true, message: "Review deleted" });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error deleting review", error });
  }
};
