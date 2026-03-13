
const getCourseBasicDetails = (course) => {
  const price = course?.price ?? null;
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
  };
};

const getCourseInfo = (course) => ({
  language: course?.language || null,
  level: course?.level || null,
  duration: course?.duration || null,
});

const getCourseCatgegory = (category) => ({
  cateId: category?.id?.toString() || category?._id?.toString() || null,
  cateName: category?.name || null,
  cateSlug: category?.slug || null,
});

const getCourseInstructor = (instructor) => ({
  insId: instructor?.ref?.toString() || null,
  insName: instructor?.name || null,
  insAvatar: instructor?.avatar || null,
});

const getCourseStats = (course) => ({
  ratingTotal: course?.rating?.total || 0,
  ratingCount: course?.rating?.count || 0,
  studentsEnrolled: course?.studentsEnrolled || 0,
  lecturesCount: course?.lecturesCount || 0,
});

const getCourseTime = (course) => ({
  createdAt: course?.createdAt || null,
  updatedAt: course?.updatedAt || null,
});

const getCourseFreeCurriculum = (curriculum) => {
  return (curriculum || []).map(section => ({
    title: section?.title || null,
    lectures: (section?.lectures || []).map(lecture => {
      const publicData = {
        lecId: lecture?._id || null,
        title: lecture?.title || null,
        duration: lecture?.duration || 0,
        isFree: lecture?.isFree ?? false,
      };

      if (lecture?.isFree) {
        publicData.videoId = lecture?.videoId || null;
      }

      return publicData;
    })
  }));
};

const getCourseCurriculum = (curriculum, hasAiData = false) => {
  return (curriculum || []).map(section => ({
    secId: section?._id || null,
    title: section?.title || null,
    lectures: (section?.lectures || []).map(lecture => ({
      lecId: lecture?._id || null,
      title: lecture?.title || null,
      duration: lecture?.duration || 0,
      videoId: lecture?.videoId || null,
      isFree: lecture?.isFree ?? false,
      ...(hasAiData && { aiData: lecture?.aiData })
    }))
  }));
};

export const toCourseCardDto = (course) => {
  if (!course) return null;

  return {
    ...getCourseBasicDetails(course),

    level: course.level,
    duration: course.duration,

    ...getCourseCatgegory(course.category),
    ...getCourseInstructor(course.instructor),
  };
};

export const toCourseCardDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(course => toCourseCardDto(course));
};

export const toCourseDetailsDto = (details) => {
  if (!details) return null;

  return {
    ...getCourseBasicDetails(details),

    description: details.description || null,
    previewVideo: details.previewVideo || null,

    ...getCourseInfo(details),

    tags: details.tags || [],

    stats: getCourseStats(details),

    curriculum: getCourseFreeCurriculum(details.curriculum?.sections),

    category: getCourseCatgegory(details.category),
    instructor: getCourseInstructor(details.instructor),

    updatedAt: details.updatedAt || null,
  };
};

export const toCourseCartItemDto = (course, addedAt) => {
  if (!course) return null;
  return {
    ...getCourseBasicDetails(course),
    addedAt,
  }
};

export default {
  toCourseCardDto,
  toCourseCardDtoList,
  toCourseDetailsDto,
  toCourseCartItemDto,

};