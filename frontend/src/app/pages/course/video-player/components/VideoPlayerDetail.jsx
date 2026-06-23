import { useCallback, useMemo, useState } from "react";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import useVideoPlayerData from "../hooks/useVideoPlayerData";
import useVideoPlayerTracking from "../hooks/useVideoPlayerTracking";
import useQuizOverlay from "../hooks/useQuizOverlay";
import useNotes from "../hooks/useNotes";

import CoursePlaylistSidebar from "./CoursePlaylistSidebar";
import LectureConclusionModal from "./LectureConclusionModal";
import NoteProgressMarkers from "./notes/NoteProgressMarkers";
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
  } = useVideoPlayerData(course, courseId, lectureId, localProgressOverrides);

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
    seekTo,
    getCurrentTime,
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

  const { activeQuiz, quizResults, hasTimestampQuizzes, onQuizAnswer, onQuizContinue } = useQuizOverlay({
    playerContainerRef,
    quizzes: currentLecture?.aiData?.quizzes || [],
    source,
    playerKey,
  });

  // Notes state lifted here so both NoteProgressMarkers and NoteSidebar share it
  const notesApi = useNotes({ lectureId, courseId });

  const handleSelectLecture = useCallback(
    (lecture) => {
      if (!lecture?.lecId) return;
      navigate(`/student/courses/${courseId}/watch/${lecture.lecId}`);
    },
    [navigate, courseId]
  );

  const handleNextLesson = useCallback(() => {
    setShowConclusionDialog(false);
    if (!lectures || !currentLecture) return;
    const currentIndex = lectures.findIndex((l) => l.lecId === currentLecture.lecId);
    if (currentIndex !== -1 && currentIndex < lectures.length - 1) {
      handleSelectLecture(lectures[currentIndex + 1]);
    }
  }, [lectures, currentLecture, handleSelectLecture, setShowConclusionDialog]);

  const hasNextLesson = useMemo(() => {
    if (!lectures || !currentLecture) return false;
    const index = lectures.findIndex((l) => l.lecId === currentLecture.lecId);
    return index !== -1 && index < lectures.length - 1;
  }, [lectures, currentLecture]);

  const isLastLecture = useMemo(() => {
    if (!lectures || !currentLecture) return false;
    const index = lectures.findIndex((l) => l.lecId === currentLecture.lecId);
    return index !== -1 && index === lectures.length - 1;
  }, [lectures, currentLecture]);

  return (
    <section className="py-0 position-relative vh-100 overflow-hidden bg-light">
      <Row className="g-0 h-100">
        <div className="d-flex w-100 flex-row h-100">
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
              activeQuiz={activeQuiz}
              quizTotal={(currentLecture?.aiData?.quizzes || []).filter((q) => q.timestamp != null).length}
              onQuizAnswer={onQuizAnswer}
              onQuizContinue={onQuizContinue}
            />
          </div>

          <CoursePlaylistSidebar
            course={course}
            currentLectureId={lectureId}
            lectureProgressMap={lectureProgressMap}
            onSelectLecture={handleSelectLecture}
            courseId={courseId}
            lectureTitle={currentLecture?.title}
            seekTo={seekTo}
            getCurrentTime={getCurrentTime}
            notesApi={notesApi}
          />
        </div>
      </Row>

      {/* Note timestamp markers on Plyr seek bar */}
      <NoteProgressMarkers
        notes={notesApi.notes}
        playerContainerRef={playerContainerRef}
        playerKey={playerKey}
      />

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
        quizResults={hasTimestampQuizzes ? quizResults : null}
      />
    </section>
  );
}
