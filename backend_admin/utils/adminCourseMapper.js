const isObject = (val) => val && typeof val === "object";

const getStringId = (value) => {
  if (!value) return null;

  if (isObject(value) && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const hasPendingChanges = (pendingUpdate) => {
  return !!(
    pendingUpdate?.data &&
    isObject(pendingUpdate.data) &&
    Object.keys(pendingUpdate.data).length > 0
  );
};

const getCourseBasicDetails = (course) => {
  const price = course?.price ?? null;
  const discountPrice = course?.discountPrice ?? null;
  const enableDiscount = course?.enableDiscount ?? false;

  const effectivePrice = enableDiscount ? discountPrice ?? price : price;
  const isFree = Number(effectivePrice) === 0;

  return {
    courseId: getStringId(course?._id || course?.id),

    title: course?.title ?? null,
    subtitle: course?.subtitle ?? null,
    description: course?.description ?? null,

    image: course?.image ?? null,
    thumbnail: course?.thumbnail || course?.image || null,
    previewVideo: course?.previewVideo ?? null,

    price,
    discountPrice,
    enableDiscount,
    effectivePrice,
    isFree,
  };
};

const getCourseInfo = (course) => {
  return {
    language: course?.language ?? null,
    level: course?.level ?? null,
    duration: course?.duration ?? 0,
    durationUnit: course?.durationUnit ?? null,
  };
};

const getCourseStatus = (course) => {
  return {
    status: course?.status ?? null,
    previousStatus: course?.previousStatus ?? null,
    isPrivate: course?.isPrivate ?? true,
    isDeleted: course?.isDeleted ?? false,

    hasPendingChanges: hasPendingChanges(course?.pendingUpdate),
    pendingUpdateStatus: course?.pendingUpdate?.status ?? null,
    pendingSubmittedAt: course?.pendingUpdate?.submittedAt ?? null,
  };
};

const getCourseStats = (course) => {
  return {
    studentsEnrolled: course?.studentsEnrolled ?? 0,
    sectionsCount: course?.sectionsCount ?? 0,
    lecturesCount: course?.lecturesCount ?? 0,
    ratingTotal: course?.rating?.total ?? 0,
    ratingCount: course?.rating?.count ?? 0,
  };
};

const getCourseRating = (rating) => {
  return {
    total: rating?.total ?? 0,
    count: rating?.count ?? 0,
    stars: {
      1: rating?.stars?.["1"] ?? 0,
      2: rating?.stars?.["2"] ?? 0,
      3: rating?.stars?.["3"] ?? 0,
      4: rating?.stars?.["4"] ?? 0,
      5: rating?.stars?.["5"] ?? 0,
    },
  };
};

const getCourseCategory = (category) => {
  return {
    cateId: getStringId(category),
    name: category?.name ?? null,
    slug: category?.slug ?? null,
  };
};

const getCourseInstructor = (instructor) => {
  const ref = instructor?.ref;

  return {
    insId: getStringId(ref),
    name: ref?.name ?? instructor?.name ?? null,
    email: ref?.email ?? instructor?.email ?? null,
    avatar: ref?.pfpImg ?? instructor?.avatar ?? null,

    stats: instructor?.stats
      ? {
          averageRating: instructor.stats.averageRating ?? 0,
          totalCourses: instructor.stats.totalCourses ?? 0,
          totalReviews: instructor.stats.totalReviews ?? 0,
          totalStudents: instructor.stats.totalStudents ?? 0,
        }
      : undefined,
  };
};

const getCourseTime = (course) => {
  return {
    createdAt: course?.createdAt ?? null,
    updatedAt: course?.updatedAt ?? null,
  };
};

export const getAdminCourseCurriculum = (sections = [], hasAiData = false) => {
  if (!Array.isArray(sections)) return [];

  return sections.map((section) => ({
    secId: getStringId(section?._id),
    title: section?.title ?? null,

    lectures: Array.isArray(section?.lectures)
      ? section.lectures.map((lecture) => ({
          lecId: getStringId(lecture?._id),
          title: lecture?.title ?? null,
          duration: lecture?.duration ?? 0,

          videoId: lecture?.videoId ?? null,
          oldVideoId: lecture?.oldVideoId ?? null,
          isFree: lecture?.isFree ?? false,

          ...(hasAiData && {
            aiData: getAdminAiData(lecture?.aiData),
          }),
        }))
      : [],
  }));
};

export const getAdminAiData = (aiData) => {
  if (!aiData || Object.keys(aiData).length === 0) return null;

  const raw =
    typeof aiData.toJSON === "function"
      ? aiData.toJSON()
      : aiData;

  return {
    summary: raw?.summary ?? null,
    status: raw?.status ?? null,

    lessonNotes: {
      keyConcepts: Array.isArray(raw?.lessonNotes?.keyConcepts)
        ? raw.lessonNotes.keyConcepts.map((item) => ({
            term: item?.term ?? null,
            definition: item?.definition ?? null,
          }))
        : [],

      mainPoints: raw?.lessonNotes?.mainPoints ?? [],
      practicalTips: raw?.lessonNotes?.practicalTips ?? [],
    },

    quizzes: Array.isArray(raw?.quizzes)
      ? raw.quizzes.map((quiz) => ({
          questId: getStringId(quiz?._id),
          question: quiz?.question ?? null,
          options: quiz?.options ?? [],
          correctAnswer: quiz?.correctAnswer ?? null,
          explanation: quiz?.explanation ?? null,
          topic: quiz?.topic ?? null,
        }))
      : [],
  };
};

export const toAdminCourseDetailsDto = (course) => {
  if (!course) return null;

  return {
    ...getCourseBasicDetails(course),
    ...getCourseInfo(course),
    ...getCourseStatus(course),

    tags: course?.tags ?? [],

    ...getCourseStats(course),

    rating: getCourseRating(course?.rating),

    category: getCourseCategory(course?.category),
    instructor: getCourseInstructor(course?.instructor),

    curriculum: getAdminCourseCurriculum(
      course?.curriculum?.sections || [],
      false
    ),

    ...getCourseTime(course),
  };
};

export const toAdminCourseRowItemDto = (course) => {
  if (!course) return null;

  const pending = hasPendingChanges(course?.pendingUpdate);

  return {
    ...getCourseBasicDetails(course),
    ...getCourseInfo(course),
    ...getCourseStatus(course),
    ...getCourseStats(course),

    category: getCourseCategory(course?.category),
    instructor: getCourseInstructor(course?.instructor),

    hasChanges: pending,
    requestUpdate: pending && course?.pendingUpdate?.status === "pending",

    ...getCourseTime(course),
  };
};

export const toAdminCourseRowItemDtoList = (courses = []) => {
  if (!Array.isArray(courses)) return [];
  return courses.map((course) => toAdminCourseRowItemDto(course));
};

export const toAdminSimpleCourseDto = (course) => {
  if (!course) return null;

  return {
    courseId: getStringId(course?._id || course?.id),
    title: course?.title ?? null,
    status: course?.status ?? null,
    isPrivate: course?.isPrivate ?? true,
    isDeleted: course?.isDeleted ?? false,
  };
};

export const toAdminCourseReviewDto = (review) => {
  if (!review) return null;

  return {
    reviewId: getStringId(review?._id),

    userId: getStringId(review?.user),
    userName: review?.user?.name ?? null,
    userEmail: review?.user?.email ?? null,
    userAvatar: review?.user?.pfpImg ?? null,

    rating: review?.rating ?? null,
    description: review?.description ?? null,

    createdAt: review?.createdAt ?? null,
    updatedAt: review?.updatedAt ?? null,
  };
};

export const toAdminCourseReviewDtoList = (reviews = []) => {
  if (!Array.isArray(reviews)) return [];
  return reviews.map((review) => toAdminCourseReviewDto(review));
};