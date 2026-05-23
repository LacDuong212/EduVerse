import { UPDATE_STATUS_ENUM as UPDATE_STATUS } from "../models/courseModel.js";

// COURSE --
const hasPendingChanges = (pendingUpdate) =>
  pendingUpdate?.data && Object.keys(pendingUpdate.data).length > 0;

export const toCourseDto = (course) => {
  if (!course) return null;

  const hasChanges = hasPendingChanges(course.pendingUpdate) ?? false;
  const requestUpdate = hasChanges && course.pendingUpdate?.status === UPDATE_STATUS?.pending;

  const category = {
    _id: course.category?._id || course.category || null,
    name: course.category?.name || null,
  };

  const instructor = {
    _id: course.instructor?.ref?._id || course.instructor?.ref || null,
    name: course.instructor?.ref?.name || course.instructor?.name || null,
    pfpImg: course.instructor?.ref?.pfpImg || course.instructor?.avatar || null,
  };

  return {
    _id: course._id || null,
    title: course.title ?? null,
    subtitle: course.subtitle ?? null,
    description: course.description ?? null,
    language: course.language || null,
    level: course.level || null,
    duration: course.duration || null,
    sectionsCount: course.sectionsCount ?? 0,
    lecturesCount: course.lecturesCount ?? 0,
    studentsEnrolled: course.studentsEnrolled ?? 0,
    tags: course.tags ?? null,

    image: course.image ?? null,
    thumbnail: course.thumbnail ?? null,
    previewVideo: course.previewVideo ?? null,

    price: course.price ?? null,
    discountPrice: course.discountPrice ?? null,
    enableDiscount: course.enableDiscount ?? false,

    ratingTotal: course.rating?.total || 0,
    ratingCount: course.rating?.count || 0,

    status: course.status ?? null,

    category,
    instructor,

    createdAt: course.createdAt ?? null,
    updatedAt: course.updatedAt ?? null,

    isPrivate: course.isPrivate ?? true,
    isDeleted: course.isDeleted ?? false,

    hasChanges,
    changes: course.pendingUpdate?.data || null,

    requestUpdate,
  };
};

export const toCourseDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(course => toCourseDto(course));
};

export const toCurriculumDto = (curriculum, hasAiData = false) => {
  if (!curriculum) return null;

  const aiData = (data) => {
    if (!data || Object.keys(data).length === 0) return null;

    const { summary, lessonNotes = {}, quizzes = [], status } = data;
    const { keyConcepts = [], mainPoints = [], practicalTips = [] } = lessonNotes || {};

    return {
      summary: summary,
      lessonNotes: {
        keyConcepts: keyConcepts?.map((kc) => ({
          term: kc.term,
          definition: kc.definition
        })),
        mainPoints,
        practicalTips,
      },
      quizzes: quizzes?.map((q) => ({
        _id: q._id || null,
        question: q.question ?? null,
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? null,
        explanation: q.explanation ?? null,
        topic: q.topic ?? null,
      })),
      status,
    };
  };

  const lecture = (lec) => {
    if (!lec || Object.keys(lec).length === 0) return null;

    return {
      _id: lec._id || null,
      title: lec.title || null,
      duration: lec.duration ?? 0,
      videoId: lec.videoId || null,
      isFree: lec.isFree ?? false,
      ...(hasAiData && { aiData: aiData(lec.aiData) })
    };
  };

  const section = (sec) => {
    if (!sec || Object.keys(sec).length === 0) return null;

    return {
      _id: sec._id || null,
      title: sec.title || null,
      lectures: (sec.lectures || [])?.map(l => lecture(l)),
    };
  };

  const hasChanges = hasPendingChanges(curriculum.pendingUpdate) ?? false;
  const requestUpdate = hasChanges && curriculum.pendingUpdate?.status === UPDATE_STATUS?.pending;

  return {
    _id: curriculum._id || null,
    courseId: curriculum.courseId?._id || curriculum.courseId || null,

    sections: (curriculum.sections || [])?.map(s => section(s)),

    updatedAt: curriculum.updatedAt ?? null,

    hasChanges,
    changes: curriculum.pendingUpdate?.data || null,

    requestUpdate,
  };
};

export const toFullCourseDto = (course, curriculum) => {
  return {
    course: toCourseDto(course),
    curriculum: toCurriculumDto(curriculum),
  };
};