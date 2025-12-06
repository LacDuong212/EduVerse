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

  const lectureDurationSec = typeof currentLecture?.duration === "number" ? currentLecture.duration : undefined;

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
    setHasStartedPlayback(false); // Reset playback state
    // Khởi tạo override rỗng để tránh lỗi
    setLocalProgressOverrides((prev) => ({ ...prev, [currentLecture._id]: prev[currentLecture._id] || {} }));
  }, [courseId, currentLecture?._id, resetTracking, setLocalProgressOverrides]);

  // 3. Logic hiển thị Resume Dialog
  useEffect(() => {
    if (!currentLecture?._id || hasStartedPlayback) return;
    if (resumeShownForLectureId === currentLecture._id) return;

    const savedPos = currentProgress?.lastPositionSec || 0;
    const isCompleted = currentProgress?.status === "completed";

    if (savedPos > 0 && !isCompleted) {
      setShowResumeDialog(true);
      setResumeShownForLectureId(currentLecture._id);
    } else {
      setShowResumeDialog(false);
    }
  }, [currentLecture?._id, currentProgress, hasStartedPlayback, resumeShownForLectureId]);

  // 4. Attach Events (TimeUpdate, Ended)
  useEffect(() => {
    if (!currentLecture?._id || !source) return;
    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    const handleTime = () => {
      const t = videoEl.currentTime || 0;
      const dur = videoEl.duration || lectureDurationSec || 0;

      if (!hasStartedPlayback && t > 0) setHasStartedPlayback(true);
      if (currentProgress?.status === "completed") return; // Đã xong thì thôi

      // Debounce logic đơn giản: không report lại vị trí cũ sau F5
      const previousPos = currentProgress?.lastPositionSec || 0;
      if (t <= previousPos && !hasStartedPlayback) return; 

      reportTimeUpdate(t);

      // Update Local UI ngay lập tức
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
      if (currentProgress?.status !== "completed") {
        reportCompleted(t, videoEl.duration);
      }
      setLocalProgressOverrides((prev) => ({
        ...prev,
        [currentLecture._id]: {
          ...(prev[currentLecture._id] || {}),
          status: "completed",
          lastPositionSec: t,
          durationSec: t,
        },
      }));
    };

    videoEl.addEventListener("timeupdate", handleTime);
    videoEl.addEventListener("ended", handleEnded);
    return () => {
      videoEl.removeEventListener("timeupdate", handleTime);
      videoEl.removeEventListener("ended", handleEnded);
    };
  }, [currentLecture?._id, source, playerKey, hasStartedPlayback, currentProgress, lectureDurationSec, reportTimeUpdate, reportCompleted, setLocalProgressOverrides]);

  // 5. Logic Seek (Auto seek khi user chọn Resume/Restart)
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
    const pos = currentProgress?.lastPositionSec || 0;
    if (pos > 0) setPendingSeekSec(pos);
  }, [currentProgress]);

  const handleRestart = useCallback(() => {
    setShowResumeDialog(false);
    setPendingSeekSec(0);
    if (currentLecture?._id) {
       // Reset local override về 0
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
    // data for dialog
    savedPos: currentProgress?.lastPositionSec || 0,
    durationForDialog: currentProgress?.durationSec ?? lectureDurationSec ?? 0
  };
}