const getCourseCatgegory = (category) => ({
  cateId: getStringId(category) || null,
  cateName: category?.name || null,
  cateSlug: category?.slug || null,
});

export const toWishlistDto = (course) => {
  if (!course) return null;

  const price = course?.price ?? null;
  const discountPrice = course?.discountPrice ?? null;
  const enableDiscount = course?.enableDiscount ?? false;

  const effectivePrice = enableDiscount
    ? (discountPrice ?? price)
    : price;

  const isFree = effectivePrice === 0;

  const categoryName = course?.category?.name || null;

  const ratingTotal = course?.rating?.total || 0;
  const ratingCount = course?.rating?.count || 0;

  return {
    courseId: course?._id?.toString() || null,

    title: course?.title || null,
    subtitle: course?.subtitle || null,
    image: course?.image || null,
    thumbnail: course?.thumbnail || null,
    duration: course?.duration || null,
    lecturesCount: course?.lecturesCount || null,


    price,
    discountPrice,
    enableDiscount,
    isFree,

    level: course?.level || null,
    category:{
      name: categoryName
    },

    rating: {
      total: ratingTotal,
      count: ratingCount
    },
    lecturesCount: course?.lecturesCount || 0
  }
}

export const toWishlistDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];

  return courses
    .map(toWishlistDto)
    .filter(Boolean);
}