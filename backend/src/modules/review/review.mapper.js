
export const toSimpleReviewDto = (review) => {
  if (!review) return null;

  return {
    reviewId: review._id?.toString(),
    rating: review.rating ?? null,
    description: review.description || null,
    updatedAt: review.updatedAt,
  };
};

export const toCourseReviewDto = (review) => {
  if (!review) return null;

  return {
    userId: review.user?._id,
    userName: review.user?.name || null,
    userAvatar: review.user?.pfpImg || null,

    reviewId: review._id?.toString(),
    rating: review.rating ?? null,
    description: review.description || null,
    
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
};