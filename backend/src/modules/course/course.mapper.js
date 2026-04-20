
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
  insAvatar: instructor?.pfpImg || instructor?.avatar || null,
});

const getCourseStats = (course) => ({
  ratingTotal: course?.rating?.total || 0,
  ratingCount: course?.rating?.count || 0,
  studentsEnrolled: course?.studentsEnrolled || 0,
  sectionsCount: course?.sectionsCount || 0,
  lecturesCount: course?.lecturesCount || 0,
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
    secId: section?._id || null,
    title: section?.title || null,
    lectures: (section?.lectures || []).map(lecture => ({
      lecId: lecture?._id || null,
      title: lecture?.title || null,
      duration: lecture?.duration || 0,
      videoId: lecture?.videoId || null,
      isFree: lecture?.isFree ?? false,
      ...(hasAiData && { aiData: getAiData(lecture?.aiData) })
    }))
  }));
};

const getAiData = (aiData) => {
  // Handle both Mongoose subdocuments (have .toJSON) and plain lean objects
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
    ...getCourseCatgegory(course.category),
    ...getCourseTime(course)
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
    courseId: course._id?.toString() || null,
    title: course.title || null,
    subtitle: course.subtitle || null,
    description: course.description || null,
    image: course.image || null,
    tags: course.tags || null,
    price: course.price || null,
    discountPrice: course.discountPrice || null,
    enableDiscount: course.enableDiscount ?? false,
    ...getCourseInfo(course),
    thumbnail: course.thumbnail || null,
    previewVideo: course.previewVideo || null,
    status: course.status || null,
    categoryId: (course.category?._id || course.category)?.toString() || null,
    isPrivate: course.isPrivate ?? true,
    hasPendingChanges: !!course.hasPendingChanges, 
    
    curriculum: {
      sections: getCourseCurriculum(curriculum?.sections, true) || null,
      hasPendingChanges: !!curriculum?.hasPendingChanges,
    },
  };
};