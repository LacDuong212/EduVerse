import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";

// Hooks
import useVideoPlayerData from "../hooks/useVideoPlayerData";
import useVideoPlayerTracking from "../hooks/useVideoPlayerTracking";

// Components
import VideoScreen from "./VideoScreen";
import CoursePlaylistSidebar from "./CoursePlaylistSidebar";
import ResumeProgressDialog from "./ResumeProgressDialog";

export default function VideoPlayerDetail({
  course,
  loading,
  error,
  courseId,
  lectureId,
}) {
  const navigate = useNavigate();
  // State override UI local
  const [localProgressOverrides, setLocalProgressOverrides] = useState({});

  // 1. Lấy dữ liệu video
  const {
    currentLecture,
    streamLoading,
    streamError,
    source,
    playerKey,
    lectureProgressMap,
    currentProgress
  } = useVideoPlayerData(course, courseId, lectureId, localProgressOverrides);

  // 2. Setup tracking & logic điều khiển player
  const {
    playerContainerRef,
    showResumeDialog,
    setShowResumeDialog,
    handleResume,
    handleRestart,
    savedPos,
    durationForDialog
  } = useVideoPlayerTracking({
    courseId,
    currentLecture,
    source,
    playerKey,
    currentProgress,
    setLocalProgressOverrides
  });

  // Handler chọn bài
  const handleSelectLecture = useCallback((lec) => {
      if (!lec?._id) return;
      navigate(`/courses/${courseId}/watch/${lec._id}`);
  }, [navigate, courseId]);

  return (
    <section className="py-0 bg-dark position-relative min-vh-100">
      <Row className="g-0">
        <div className="d-flex w-100 flex-column flex-lg-row"> {/* Responsive flex */}
          
          {/* LEFT: Video Screen */}
          <div className="flex-grow-1">
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
    </section>
  );
}