
export const toLectureDto = (lecture) => {
  if (!lecture) return null;

  return {
    lecId: lecture.lectureId?.toString() || lecture.lecId?.toTring() || lecture._id?.toTring(),
    status: lecture.status || null,
    lastPositionSec: lecture.lastPositionSec || 0,
    durationSec: lecture.durationSec || 0,
    totalTimeSpentSec: lecture.totalTimeSpentSec || 0,
    viewCount: lecture.viewCount || 0,
    completedAt: lecture.completedAt || null,
    lastActivityAt: lecture.lastActivityAt || null,
  };
};

export const toLectureDtoList = (lectures) => {
  if (!lectures || !Array.isArray(lectures)) return [];
  return lectures.map(lecture => toLectureDto(lecture));
};

export const toCourseProgressDto = (progress) => {
  if (!progress) return null;

  return {
    courseId: progress.course?._id?.toString() || progress.course?.toString(),
    totalLectures: progress.totalLectures || 0,
    completedLecturesCount: progress.completedLecturesCount || 0,
    totalTimeSpentSec: progress.totalTimeSpentSec || 0,
    lastLectureId: progress.lastLectureId?.toString(),
    lastPositionSec: progress.lastPositionSec || 0,
    lectures: toLectureDtoList(progress.lectures),
    firstStartedAt: progress.firstStartedAt || progress.createdAt || null,
    lastActivityAt: progress.lastActivityAt || null,
    isCompleted: progress.isCompleted ?? false,
    aiAssessment: progress.aiAssessment
  };
};