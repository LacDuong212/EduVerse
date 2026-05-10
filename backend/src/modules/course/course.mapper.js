import mongoose from "mongoose";

const isPopulated = (val) => val instanceof mongoose.Model || (val && typeof val === "object" && val._id);
const getStringId = (id) => isPopulated(id) ? id._id?.toString() : id?.toString();

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
  cateId: getStringId(category) || null,
  name: category?.name || null,
  slug: category?.slug || null,
});

const getCourseInstructor = (instructor) => ({
  insId: getStringId(instructor?.ref) || null,
  name: instructor?.ref?.name || instructor?.name || null,
  avatar: instructor?.ref?.pfpImg || instructor?.avatar || null,
});

const getCourseStats = (course) => ({
  ratingTotal: course?.rating?.total || 0,
  ratingCount: course?.rating?.count || 0,
  studentsEnrolled: course?.studentsEnrolled || 0,
  sectionsCount: course?.sectionsCount || 0,
  lecturesCount: course?.lecturesCount || 0,
});

const getCourseRating = (rating) => ({
  total: rating?.total || 0,
  count: rating?.count || 0,
  stars: {
    1: rating?.stars?.["1"] || 0,
    2: rating?.stars?.["2"] || 0,
    3: rating?.stars?.["3"] || 0,
    4: rating?.stars?.["4"] || 0,
    5: rating?.stars?.["5"] || 0,
  },
});

const getCourseTime = (course) => ({
  createdAt: course?.createdAt || null,
  updatedAt: course?.updatedAt || null,
});

export const getCourseFreeCurriculum = (curriculum) => {
  return (curriculum || []).map(section => ({
    secId: section?._id || null,
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

export const getCourseCurriculum = (curriculum, hasAiData = false) => {
  return (curriculum || []).map(section => ({
    secId: section?._id?.toString() ?? null,
    title: section?.title ?? null,
    lectures: (section?.lectures || []).map(lecture => ({
      lecId: lecture?._id?.toString() ?? null,
      title: lecture?.title ?? null,
      duration: lecture?.duration ?? 0,
      oldVideoId: lecture?.oldVideoId,
      videoId: lecture?.videoId ?? null,
      isFree: lecture?.isFree ?? false,
      ...(hasAiData && { aiData: getAiData(lecture?.aiData) })
    }))
  }));
};

export const getAiData = (aiData) => {
  aiData = typeof aiData?.toJSON === "function" ? aiData.toJSON() : aiData;
  if (!aiData || Object.keys(aiData).length === 0) return null;

  const keyConcepts = (aiData.lessonNotes?.keyConcepts || []).map((kc) => ({
    term: kc.term,
    definition: kc.definition
  }));
  const mainPoints = aiData.lessonNotes?.mainPoints || [];
  const practicalTips = aiData.lessonNotes?.practicalTips || [];
  const quizzes = (aiData.quizzes || []).map((q) => ({
    questId: q._id?.toString(),
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    topic: q.topic
  }));

  return {
    summary: aiData.summary,
    lessonNotes: {
      keyConcepts,
      mainPoints,
      practicalTips
    },
    quizzes,
    status: aiData.status,
  };
};

export const toCourseCardDto = (course) => {
  if (!course) return null;

  const category = course.category || null;
  const instructor = course.instructor || null;

  return {
    ...getCourseBasicDetails(course),

    level: course.level,
    duration: course.duration,
    ...getCourseStats(course),

    category: getCourseCatgegory(course.category),
    instructor: getCourseInstructor(course.instructor),
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

    studentsEnrolled: details?.studentsEnrolled || 0,
    sectionsCount: details?.sectionsCount || 0,
    lecturesCount: details?.lecturesCount || 0,

    tags: details.tags || [],
    
    isPrivate: details.isPrivate ?? undefined,

    rating: getCourseRating(details.rating),

    curriculum: getCourseFreeCurriculum(details.curriculum?.sections),

    category: getCourseCatgegory(details.category),
    instructor: getCourseInstructor(details.instructor),

    ...getCourseTime(details),
  };
};

export const toCourseCartItemDto = (course, addedAt) => {
  if (!course) return null;
  return {
    ...getCourseBasicDetails(course),
    addedAt,
  }
};

export const toCourseRowItemDto = (course) => {
  if (!course) return null;

  return {
    ...getCourseBasicDetails(course),
    status: course.status || null,
    ...getCourseStats(course),
    isPrivate: course.isPrivate ?? true,
    ...getCourseTime(course),
  };
};

export const toCourseRowItemDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(course => toCourseRowItemDto(course));
};

export const toInstructorCourseDto = (course) => {
  if (!course) return null;

  return {
    ...getCourseBasicDetails(course),
    description: course.description || null,
    status: course.status || null,
    ...getCourseInfo(course),
    ...getCourseStats(course),
    tags: course.tags || [],
    isPrivate: course.isPrivate ?? true,
    cateId: getStringId(course?.category) || null,
    cateName: course?.category?.name || null,
    ...getCourseTime(course),
  };
};

export const toSimpleCourse = (course) => {
  if (!course) return null;

  return {
    courseId: course._id?.toString(),
    title: course.title || null,
    status: course.status || null,
    isPrivate: course.isPrivate ?? true,
  };
};

export const toEditCourseDto = (course, curriculum) => {
  if (!course) return null;

  return {
    courseId: course._id?.toString() ?? null,
    title: course.title ?? null,
    subtitle: course.subtitle ?? null,
    description: course.description ?? null,
    image: course.image ?? null,
    tags: course.tags ?? null,
    price: course.price ?? null,
    discountPrice: course.discountPrice ?? null,
    enableDiscount: course.enableDiscount ?? false,
    ...getCourseInfo(course),
    thumbnail: course.thumbnail ?? null,
    previewVideo: course.previewVideo ?? null,
    status: course.status ?? null,
    categoryId: (course.category?._id ?? course.category)?.toString() ?? null,
    isPrivate: course.isPrivate ?? true,
    hasPendingChanges: !!course.hasPendingChanges,

    curriculum: {
      sections: getCourseCurriculum(curriculum?.sections, true) ?? [],
      hasPendingChanges: !!curriculum?.hasPendingChanges,
    },
  };
};

export const toStudentLearningCourseDto = (course) => {
  if (!course) return null;

  return {
    courseId: course._id?.toString() || course.id?.toString() || null,

    title: course.title || null,
    subtitle: course.subtitle || null,
    description: course.description || null,

    image: course.image || null,
    thumbnail: course.thumbnail || course.image || null,
    previewVideo: course.previewVideo || null,

    language: course.language || null,
    level: course.level || null,
    duration: course.duration || 0,
    durationUnit: course.durationUnit || null,

    sectionsCount: course.sectionsCount || 0,
    lecturesCount: course.lecturesCount || 0,

    category: getCourseCatgegory(course.category),
    instructor: getCourseInstructor(course.instructor),

    curriculum: {
      sections: getCourseCurriculum(course.curriculum?.sections || [], true),
    },
  };
};