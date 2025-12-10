import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";

// Hooks
import useVideoPlayerData from "../hooks/useVideoPlayerData";
import useVideoPlayerTracking from "../hooks/useVideoPlayerTracking";

// Components
import VideoScreen from "./VideoScreen";
import CoursePlaylistSidebar from "./CoursePlaylistSidebar";
import ResumeProgressDialog from "./ResumeProgressDialog";
import LectureConclusionModal from "./LectureConclusionModal"; // Import Modal

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
    currentProgress,
    lectures // Lấy danh sách lectures phẳng từ hook (đã có ở code cũ)
  } = useVideoPlayerData(course, courseId, lectureId, localProgressOverrides);

  // 2. Setup tracking & logic điều khiển player
  const {
    playerContainerRef,
    showResumeDialog,
    setShowResumeDialog,
    handleResume,
    handleRestart,
    savedPos,
    durationForDialog,
    // Lấy state từ hook mới
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

  // Handler chuyển bài
  const handleSelectLecture = useCallback((lec) => {
      if (!lec?._id) return;
      navigate(`/courses/${courseId}/watch/${lec._id}`);
  }, [navigate, courseId]);

  //  Logic tìm bài tiếp theo
  const handleNextLesson = useCallback(() => {
    setShowConclusionDialog(false);
    if (!lectures || !currentLecture) return;

    const currentIndex = lectures.findIndex(l => l._id === currentLecture._id);
    if (currentIndex !== -1 && currentIndex < lectures.length - 1) {
      const nextLecture = lectures[currentIndex + 1];
      handleSelectLecture(nextLecture);
    } else {
      // Đã là bài cuối cùng
      // alert("Đây là bài học cuối cùng!");
    }
  }, [lectures, currentLecture, handleSelectLecture, setShowConclusionDialog]);

  // Kiểm tra xem có phải bài cuối không để ẩn hiện nút "Next" trong modal
  const hasNextLesson = useMemo(() => {
    if (!lectures || !currentLecture) return false;
    const idx = lectures.findIndex(l => l._id === currentLecture._id);
    return idx !== -1 && idx < lectures.length - 1;
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

      {/* Dialog Quiz & Summary */}
      <LectureConclusionModal 
        show={showConclusionDialog}
        onHide={() => setShowConclusionDialog(false)}
        aiData={currentLecture?.aiData}
        onNext={hasNextLesson ? handleNextLesson : null} 
      />
    </section>
  );
}