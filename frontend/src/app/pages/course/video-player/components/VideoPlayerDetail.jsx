import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";

import useVideoPlayerData from "../hooks/useVideoPlayerData";
import useVideoPlayerTracking from "../hooks/useVideoPlayerTracking";

import VideoScreen from "./VideoScreen";
import CoursePlaylistSidebar from "./CoursePlaylistSidebar";
import ResumeProgressDialog from "./ResumeProgressDialog";
import LectureConclusionModal from "./LectureConclusionModal"; 

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
    lectures
  } = useVideoPlayerData(course, courseId, lectureId, localProgressOverrides);

  const {
    playerContainerRef,
    showResumeDialog,
    setShowResumeDialog,
    handleResume,
    handleRestart,
    savedPos,
    durationForDialog,
    showConclusionDialog,
    setShowConclusionDialog
  } = useVideoPlayerTracking({
    courseId,
    currentLecture,
    source,
    playerKey,
    currentProgress,
    setLocalProgressOverrides
  });

  const handleSelectLecture = useCallback((lec) => {
      if (!lec?._id) return;
      navigate(`/courses/${courseId}/watch/${lec._id}`);
  }, [navigate, courseId]);

  const handleNextLesson = useCallback(() => {
    setShowConclusionDialog(false);
    if (!lectures || !currentLecture) return;

    const currentIndex = lectures.findIndex(l => l._id === currentLecture._id);
    if (currentIndex !== -1 && currentIndex < lectures.length - 1) {
      const nextLecture = lectures[currentIndex + 1];
      handleSelectLecture(nextLecture);
    }
  }, [lectures, currentLecture, handleSelectLecture, setShowConclusionDialog]);

  const hasNextLesson = useMemo(() => {
    if (!lectures || !currentLecture) return false;
    const idx = lectures.findIndex(l => l._id === currentLecture._id);
    return idx !== -1 && idx < lectures.length - 1;
  }, [lectures, currentLecture]);

  const isLastLecture = useMemo(() => {
    if (!lectures || !currentLecture) return false;
    const idx = lectures.findIndex(l => l._id === currentLecture._id);
    // Là bài cuối nếu index là phần tử cuối mảng
    return idx !== -1 && idx === lectures.length - 1;
  }, [lectures, currentLecture]);

  return (
    <section className="py-0 bg-dark position-relative min-vh-100">
      <Row className="g-0">
        <div className="d-flex w-100 flex-column flex-lg-row">
          
          {/* LEFT: Video Screen */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
             <VideoScreen 
                playerContainerRef={playerContainerRef}
                source={source}
                playerKey={playerKey}
                loading={loading}
                error={error}
                streamLoading={streamLoading}
                streamError={streamError}
                hasCourse={!!course}
                hasLecture={!!currentLecture}
             />
          </div>

          {/* RIGHT: Playlist Sidebar */}
          <CoursePlaylistSidebar 
             course={course}
             currentLectureId={lectureId}
             lectureProgressMap={lectureProgressMap}
             onSelectLecture={handleSelectLecture}
          />
        </div>
      </Row>

      {/* Dialog Resume */}
      <ResumeProgressDialog
        show={showResumeDialog}
        onClose={() => setShowResumeDialog(false)}
        onResume={handleResume}
        onRestart={handleRestart}
        savedSeconds={savedPos}
        durationSeconds={durationForDialog}
      />

      <LectureConclusionModal 
        show={showConclusionDialog}
        onHide={() => setShowConclusionDialog(false)}
        aiData={currentLecture?.aiData}
        onNext={hasNextLesson ? handleNextLesson : null} 
        
        courseId={courseId}
        lectureId={currentLecture?._id}
        isLastLecture={isLastLecture}
      />
    </section>
  );
}