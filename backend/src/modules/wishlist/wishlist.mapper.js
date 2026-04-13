export const toWishlistDto = (course) => {
  if (!course) return null;

  const price = course?.price ?? null;
  const discountPrice = course?.discountPrice ?? null;
  const enableDiscount = course?.enableDiscount ?? false;

  const effectivePrice = enableDiscount
    ? (discountPrice ?? price)
    : price;

  const isFree = effectivePrice === 0;

  const ratingTotal = course?.rating?.total || 0;
  const ratingCount = course?.rating?.count || 0;
  const ratingAvg = ratingCount
    ? Number((ratingTotal / ratingCount).toFixed(1))
    : 0;

  return {
    courseId: course?._id?.toString() || null,

    title: course?.title || null,
    subtitle: course?.subtitle || null,
    image: course?.image || null,
    thumnail: course?.thumnail || null,

    price,
    discountPrice,
    enableDiscount,
    isFree,

    level: course?.level || null,
    ratingAvg,
    lectureCount: course?.lectureCount || 0
  }
}

export const toWishlistDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];

  return courses
    .map(toWishlistDto)
    .filter(Boolean);
}