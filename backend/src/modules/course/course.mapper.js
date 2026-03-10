
export const getCommonCourseFields = (course) => {
  const price = course?.price ?? 0;
  const discountPrice = course?.discountPrice ?? null;
  const enableDiscount = course?.enableDiscount ?? false;
  
  const effectivePrice = enableDiscount ? (discountPrice ?? price) : price;
  const isFree = effectivePrice === 0;

  return {
    courseId: course?._id?.toString() || course?.id?.toString() || null,

    title: course?.title || null,
    subtitle: course?.subtitle || null,
    image: course?.image || null,
    thumbnail: course?.thumbnail || course?.image || null,
    
    price,
    discountPrice,
    enableDiscount,
    isFree,

    category: {
      id: course?.category?._id?.toString() || course?.category?.id?.toString(),
      name: course?.category?.name || null,
      slug: course?.category?.slug || null,
    },

    instructor: {
      id: course?.instructor?.ref?.toString() || null,
      name: course?.instructor?.name || null,
      avatar: course?.instructor?.avatar || null,
    },

    rating: course?.rating?.average || 0,
    ratingCount: course?.rating?.count || 0,
    studentsEnrolled: course?.studentsEnrolled || 0,
    lecturesCount: course?.lecturesCount || 0,
  };
};

export const toCourseCardDto = (course) => {
  if (!course) return null;

  const common = getCommonCourseFields(course);

  return {
    ...common,

    level: course.level,
    duration: course.duration,
  };
};

export const toCourseCardDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(course => toCourseCardDto(course));
};

export const toCourseDetailsDto = (details) => {
  if (!details) return null;

  const common = getCommonCourseFields(details);
  const freeCurriculum = (details.curriculum?.sections || []).map(section => ({
    title: section.title,
    lectures: section.lectures.map(lecture => {
      const publicData = {
        lecId: lecture._id,
        title: lecture.title,
        duration: lecture.duration,
        isFree: lecture.isFree ?? false,
      };

      if (lecture.isFree) {
        publicData.videoId = lecture.videoId;
      }

      return publicData;
    })
  }));

  return {
    ...common,

    description: details.description || null,
    previewVideo: details.previewVideo || null,

    language: details.language || null,
    level: details.level || null,
    duration: details.duration || null,

    tags: details.tags || [],

    curriculum: freeCurriculum,

    updatedAt: details.updatedAt || null,
  };
};

export default {
  toCourseCardDto,
  toCourseCardDtoList,
  toCourseDetailsDto,

};