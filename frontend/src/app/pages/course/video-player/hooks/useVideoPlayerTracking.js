import { useState, useEffect, useRef, useCallback } from "react";
import useLectureTracking from "@/hooks/useLearningProgress";

export default function useVideoPlayerTracking({
  courseId,
  currentLecture,
  source,
  playerKey,
  currentProgress,
  setLocalProgressOverrides,
}) {
  const playerContainerRef = useRef(null);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  
  // States cho Dialog & Seek
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeShownForLectureId, setResumeShownForLectureId] = useState(null);
  const [pendingSeekSec, setPendingSeekSec] = useState(null);

  // State cho Modal kết thúc bài học
  const [showConclusionDialog, setShowConclusionDialog] = useState(false);

  const lectureDurationSec = typeof currentLecture?.duration === "number" ? currentLecture.duration : undefined;

  // ✅ FIX: Khai báo savedPos ở đây để dùng được trong return
  const savedPos = currentProgress?.lastPositionSec || 0;

  // 1. Setup API Tracking Hook
  const { reportTimeUpdate, reportCompleted, resetTracking } = useLectureTracking({
    courseId,
    lectureId: currentLecture?._id,
    durationSec: lectureDurationSec,
    initialStatus: currentProgress?.status,
  });

  // 2. Reset khi đổi bài
  useEffect(() => {
    if (!currentLecture?._id) return;
    resetTracking();
    setHasStartedPlayback(false); 
    setShowConclusionDialog(false); 
    
    // Khởi tạo override rỗng
    setLocalProgressOverrides((prev) => ({ ...prev, [currentLecture._id]: prev[currentLecture._id] || {} }));
  }, [courseId, currentLecture?._id, resetTracking, setLocalProgressOverrides]);

  // 3. Logic hiển thị Resume Dialog
  useEffect(() => {
    if (!currentLecture?._id || hasStartedPlayback) return;
    if (resumeShownForLectureId === currentLecture._id) return;

    const isCompleted = currentProgress?.status === "completed";

    // Sử dụng savedPos đã khai báo ở trên
    if (savedPos > 0 && !isCompleted) {
      setShowResumeDialog(true);
      setResumeShownForLectureId(currentLecture._id);
    } else {
      setShowResumeDialog(false);
    }
  }, [currentLecture?._id, currentProgress, hasStartedPlayback, resumeShownForLectureId, savedPos]);

  // 4. Attach Events (TimeUpdate, Ended)
  useEffect(() => {
    if (!currentLecture?._id || !source) return;
    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    const handleTime = () => {
      const t = videoEl.currentTime || 0;
      const dur = videoEl.duration || lectureDurationSec || 0;

      if (!hasStartedPlayback && t > 0) setHasStartedPlayback(true);
      if (currentProgress?.status === "completed") return; 

      const previousPos = currentProgress?.lastPositionSec || 0;
      if (t <= previousPos && !hasStartedPlayback) return; 

      reportTimeUpdate(t);

      setLocalProgressOverrides((prev) => ({
        ...prev,
        [currentLecture._id]: {
          ...(prev[currentLecture._id] || {}),
          status: "in_progress",
          lastPositionSec: t,
          durationSec: dur,
        },
      }));
    };

    const handleEnded = () => {
      const t = videoEl.currentTime || videoEl.duration || 0;
      
      // 1. Report Server
      if (currentProgress?.status !== "completed") {
        reportCompleted(t, videoEl.duration);
      }
      
      // 2. Update Local UI (Completed)
      setLocalProgressOverrides((prev) => ({
        ...prev,
        [currentLecture._id]: {
          ...(prev[currentLecture._id] || {}),
          status: "completed",
          lastPositionSec: t,
          durationSec: t,
        },
      }));

      // 3. Hiển thị Modal Summary/Quiz
      const aiData = currentLecture?.aiData;
      const hasAiContent = aiData && (aiData.summary || (aiData.quizzes && aiData.quizzes.length > 0));
      
      if (hasAiContent) {
        setShowConclusionDialog(true);
      }
    };

    videoEl.addEventListener("timeupdate", handleTime);
    videoEl.addEventListener("ended", handleEnded);
    return () => {
      videoEl.removeEventListener("timeupdate", handleTime);
      videoEl.removeEventListener("ended", handleEnded);
    };
  }, [currentLecture, source, playerKey, hasStartedPlayback, currentProgress, lectureDurationSec, reportTimeUpdate, reportCompleted, setLocalProgressOverrides]);

  // 5. Logic Seek
  useEffect(() => {
    if (pendingSeekSec == null || !currentLecture?._id) return;
    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    const doSeek = () => {
      if (videoEl.duration > 0) {
        videoEl.currentTime = Math.min(pendingSeekSec, videoEl.duration - 0.1);
        setPendingSeekSec(null);
      }
    };

    if (videoEl.readyState >= 1) doSeek();
    else {
      videoEl.addEventListener("loadedmetadata", doSeek, { once: true });
    }
  }, [pendingSeekSec, currentLecture?._id]);

  // Handlers cho Dialog
  const handleResume = useCallback(() => {
    setShowResumeDialog(false);
    if (savedPos > 0) setPendingSeekSec(savedPos);
  }, [savedPos]);

  const handleRestart = useCallback(() => {
    setShowResumeDialog(false);
    setPendingSeekSec(0);
    if (currentLecture?._id) {
       setLocalProgressOverrides(prev => ({
           ...prev,
           [currentLecture._id]: { status: 'not_started', lastPositionSec: 0, durationSec: lectureDurationSec || 0 }
       }));
    }
  }, [currentLecture, lectureDurationSec, setLocalProgressOverrides]);

  return {
    playerContainerRef,
    showResumeDialog,
    setShowResumeDialog,
    handleResume,
    handleRestart,
    savedPos, // ✅ Giờ biến này đã tồn tại
    durationForDialog: currentProgress?.durationSec ?? lectureDurationSec ?? 0,
    showConclusionDialog,
    setShowConclusionDialog
  };
}