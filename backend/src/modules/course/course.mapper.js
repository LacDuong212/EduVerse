
/**
 * Transforms a raw Course document into a clean CourseCard DTO.
 * @param {Object} course - The Mongoose document or lean object
 * @returns {Object} CourseCardDto
 */
export const toCourseCardDto = (course) => {
  if (!course) return null;

  const effectivePrice = course.enableDiscount ? course.discountPrice : course.price;
  const isFree = (effectivePrice != null && effectivePrice == 0);

  return {
    courseId: course.id?.toString() || course._id?.toString(),
    title: course.title,
    subtitle: course.subtitle,
    image: course.image,
    thumbnail: course.thumbnail || course.image,

    price: course.price,
    enableDiscount: course.enableDiscount,
    discountPrice: course.discountPrice,
    isFree,

    categoryId: course.category?.id?.toString() || course.category?._id?.toString(),
    categoryName: course.category?.name,
    categorySlug: course.category?.slug,

    instructorId: course.instructor?.ref?.toString(),
    instructorName: course.instructor?.name,
    instructorAvatar: course.instructor?.avatar,

    rating: course.rating?.average || 0,
    ratingCount: course.rating?.count || 0,
    studentsEnrolled: course.studentsEnrolled || 0,
    lecturesCount: course.lecturesCount,

    level: course.level,
    duration: course.duration,
  };
};

export const toCourseCardDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(course => toCourseCardDto(course));
};

export default {
  toCourseCardDto,
  toCourseCardDtoList,
  
};