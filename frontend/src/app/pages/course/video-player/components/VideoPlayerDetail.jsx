import { useCallback, useMemo, useState } from "react";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import useVideoPlayerData from "../hooks/useVideoPlayerData";
import useVideoPlayerTracking from "../hooks/useVideoPlayerTracking";

import CoursePlaylistSidebar from "./CoursePlaylistSidebar";
import LectureConclusionModal from "./LectureConclusionModal";
import ResumeProgressDialog from "./ResumeProgressDialog";
import VideoScreen from "./VideoScreen";

export default function VideoPlayerDetail({
  course,
  loading,
  error,
  courseId,
  lectureId,
}) {
  const navigate = useNavigate();
  const [localProgressOverrides, setLocalProgressOverrides] = useState({});

  const {
    currentLecture,
    streamLoading,
    streamError,
    source,
    playerKey,
    lectureProgressMap,
    currentProgress,
    lectures,
    progressLoading,
    progressError,
    progressReady,
  } = useVideoPlayerData(
    course,
    courseId,
    lectureId,
    localProgressOverrides
  );

  const safeCurrentProgress = useMemo(() => {
    if (!currentLecture?.lecId) return null;

    return lectureProgressMap?.[currentLecture.lecId] || currentProgress || null;
  }, [currentLecture?.lecId, lectureProgressMap, currentProgress]);

  const {
    playerContainerRef,
    showResumeDialog,
    setShowResumeDialog,
    handleResume,
    handleRestart,
    savedPos,
    durationForDialog,
    showConclusionDialog,
    setShowConclusionDialog,
  } = useVideoPlayerTracking({
    courseId,
    currentLecture,
    source,
    playerKey,
    currentProgress: safeCurrentProgress,
    progressLoading,
    progressReady,
    setLocalProgressOverrides,
  });

  const handleSelectLecture = useCallback(
    (lecture) => {
      if (!lecture?.lecId) return;
      navigate(`/courses/${courseId}/watch/${lecture.lecId}`);
    },
    [navigate, courseId]
  );

  const handleNextLesson = useCallback(() => {
    setShowConclusionDialog(false);

    if (!lectures || !currentLecture) return;

    const currentIndex = lectures.findIndex(
      (lecture) => lecture.lecId === currentLecture.lecId
    );

    if (currentIndex !== -1 && currentIndex < lectures.length - 1) {
      handleSelectLecture(lectures[currentIndex + 1]);
    }
  }, [lectures, currentLecture, handleSelectLecture, setShowConclusionDialog]);

  const hasNextLesson = useMemo(() => {
    if (!lectures || !currentLecture) return false;

    const index = lectures.findIndex(
      (lecture) => lecture.lecId === currentLecture.lecId
    );

    return index !== -1 && index < lectures.length - 1;
  }, [lectures, currentLecture]);

  const isLastLecture = useMemo(() => {
    if (!lectures || !currentLecture) return false;

    const index = lectures.findIndex(
      (lecture) => lecture.lecId === currentLecture.lecId
    );

    return index !== -1 && index === lectures.length - 1;
  }, [lectures, currentLecture]);

  return (
    <section className="py-0 bg-dark position-relative min-vh-100">
      <Row className="g-0">
        <div className="d-flex w-100 flex-row">
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <VideoScreen
              playerContainerRef={playerContainerRef}
              source={source}
              playerKey={playerKey}
              loading={loading || progressLoading || !progressReady}
              error={error || progressError}
              streamLoading={streamLoading}
              streamError={streamError}
              hasCourse={!!course}
              hasLecture={!!currentLecture}
            />
          </div>

          <CoursePlaylistSidebar
            course={course}
            currentLectureId={lectureId}
            lectureProgressMap={lectureProgressMap}
            onSelectLecture={handleSelectLecture}
          />
        </div>
      </Row>

      <ResumeProgressDialog
        show={showResumeDialog}
        onClose={() => setShowResumeDialog(false)}
        onResume={handleResume}
        onRestart={handleRestart}
        savedSeconds={safeCurrentProgress?.lastPositionSec || savedPos}
        durationSeconds={
          safeCurrentProgress?.durationSec ||
          currentLecture?.duration ||
          durationForDialog
        }
      />

      <LectureConclusionModal
        show={showConclusionDialog}
        onHide={() => setShowConclusionDialog(false)}
        aiData={currentLecture?.aiData}
        onNext={hasNextLesson ? handleNextLesson : null}
        courseId={courseId}
        lectureId={currentLecture?.lecId}
        isLastLecture={isLastLecture}
      />
    </section>
  );
}