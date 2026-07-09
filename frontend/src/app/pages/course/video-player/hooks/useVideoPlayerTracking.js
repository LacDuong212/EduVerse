import { useState, useEffect, useRef, useCallback } from "react";
import useLectureTracking from "@/hooks/useLearningProgress";
import useVideoControls from "./useVideoControls";

export default function useVideoPlayerTracking({
  courseId,
  currentLecture,
  source,
  playerKey,
  currentProgress,
  progressLoading,
  progressReady = true,
  setLocalProgressOverrides,
}) {
  const playerContainerRef = useRef(null);
  useVideoControls(playerContainerRef);

  // Synchronous flag for "the user actually pressed play". Kept in a ref so the
  // timeupdate handler can read it without stale-closure issues. Distinct from a
  // browser-fired timeupdate (which happens on reload when the browser restores
  // the media element's last position) — only a real `play` event flips this.
  const hasStartedRef = useRef(false);

  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeShownForLectureId, setResumeShownForLectureId] = useState(null);
  const [pendingSeekSec, setPendingSeekSec] = useState(null);
  const [showConclusionDialog, setShowConclusionDialog] = useState(false);

  const lectureId = currentLecture?.lecId;
  const lectureDurationSec =
    typeof currentLecture?.duration === "number" ? currentLecture.duration : 0;

  const savedPos = Math.max(0, Number(currentProgress?.lastPositionSec) || 0);

  const { reportTimeUpdate, reportCompleted, resetTracking } =
    useLectureTracking({
      courseId,
      lectureId,
      durationSec: lectureDurationSec,
      initialStatus: currentProgress?.status,
    });

  useEffect(() => {
    if (!lectureId) return;

    resetTracking?.();
    hasStartedRef.current = false;
    setHasStartedPlayback(false);
    setShowResumeDialog(false);
    setShowConclusionDialog(false);
    setResumeShownForLectureId(null);
    setPendingSeekSec(null);
  }, [courseId, lectureId, resetTracking]);

  useEffect(() => {
    if (!progressReady || progressLoading) return;
    if (!lectureId) return;
    if (hasStartedPlayback) return;
    if (resumeShownForLectureId === lectureId) return;

    const shouldShowResume =
      currentProgress?.lecId === lectureId &&
      currentProgress?.status === "in_progress" &&
      savedPos >= 5;

    if (shouldShowResume) {
      setShowResumeDialog(true);
      setResumeShownForLectureId(lectureId);
    } else {
      setShowResumeDialog(false);
    }
  }, [
    progressReady,
    progressLoading,
    lectureId,
    hasStartedPlayback,
    resumeShownForLectureId,
    currentProgress?.lecId,
    currentProgress?.status,
    savedPos,
  ]);

  useEffect(() => {
    if (!progressReady || progressLoading) return;
    if (!lectureId || !source) return;

    const videoEl = playerContainerRef.current?.querySelector("video");
    if (!videoEl) return;

    const handlePlay = () => {
      // A genuine play — safe to hide the resume prompt and start tracking.
      hasStartedRef.current = true;
      setHasStartedPlayback(true);
      setShowResumeDialog(false);
    };

    const handleTimeUpdate = () => {
      const currentTime = videoEl.currentTime || 0;
      const duration = videoEl.duration || lectureDurationSec || 0;

      if (currentTime <= 0.5) return;

      // Ignore time updates until the user has actually pressed play. On reload
      // the browser fires a timeupdate with the restored position, which used to
      // flip hasStartedPlayback and suppress the resume dialog before it showed.
      if (!hasStartedRef.current) return;

      if (currentProgress?.status === "completed") return;

      reportTimeUpdate(currentTime, duration);

      setLocalProgressOverrides((prev) => ({
        ...prev,
        [lectureId]: {
          ...(prev[lectureId] || {}),
          lecId: lectureId,
          status: "in_progress",
          lastPositionSec: currentTime,
          durationSec: duration,
        },
      }));
    };

    const handleEnded = () => {
      const duration = videoEl.duration || lectureDurationSec || 0;
      const currentTime = videoEl.currentTime || duration || 0;

      if (currentProgress?.status !== "completed") {
        reportCompleted(currentTime, duration);
      }

      setLocalProgressOverrides((prev) => ({
        ...prev,
        [lectureId]: {
          ...(prev[lectureId] || {}),
          lecId: lectureId,
          status: "completed",
          lastPositionSec: duration || currentTime,
          durationSec: duration || currentTime,
        },
      }));

      const aiData = currentLecture?.aiData;
      const hasAiContent =
        aiData &&
        (aiData.summary ||
          aiData.lessonNotes ||
          (aiData.quizzes && aiData.quizzes.length > 0));

      if (hasAiContent) {
        setShowConclusionDialog(true);
      }
    };

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("ended", handleEnded);

    return () => {
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      videoEl.removeEventListener("ended", handleEnded);
    };
  }, [
    progressReady,
    progressLoading,
    lectureId,
    source,
    playerKey,
    hasStartedPlayback,
    currentProgress?.status,
    lectureDurationSec,
    reportTimeUpdate,
    reportCompleted,
    setLocalProgressOverrides,
    currentLecture,
  ]);

  useEffect(() => {
    if (!progressReady || progressLoading) return;
    if (pendingSeekSec == null || !lectureId) return;

    let cancelled = false;

    const trySeek = () => {
      if (cancelled) return;

      const videoEl = playerContainerRef.current?.querySelector("video");
      if (!videoEl) {
        setTimeout(trySeek, 100);
        return;
      }

      const doSeek = () => {
        if (cancelled) return;

        const duration = videoEl.duration || lectureDurationSec || 0;
        const target =
          duration > 0
            ? Math.min(pendingSeekSec, Math.max(0, duration - 0.1))
            : pendingSeekSec;

        videoEl.currentTime = target;
        setPendingSeekSec(null);
      };

      if (videoEl.readyState >= 1) {
        doSeek();
      } else {
        videoEl.addEventListener("loadedmetadata", doSeek, { once: true });
      }
    };

    trySeek();

    return () => {
      cancelled = true;
    };
  }, [
    progressReady,
    progressLoading,
    pendingSeekSec,
    lectureId,
    lectureDurationSec,
    source,
    playerKey,
  ]);

  const handleResume = useCallback(() => {
    setShowResumeDialog(false);

    if (savedPos >= 5) {
      setPendingSeekSec(savedPos);
    }
  }, [savedPos]);

  const handleRestart = useCallback(() => {
    setShowResumeDialog(false);
    setPendingSeekSec(0);

    if (lectureId) {
      setLocalProgressOverrides((prev) => ({
        ...prev,
        [lectureId]: {
          lecId: lectureId,
          status: "not_started",
          lastPositionSec: 0,
          durationSec: lectureDurationSec || 0,
        },
      }));
    }
  }, [lectureId, lectureDurationSec, setLocalProgressOverrides]);

  const seekTo = useCallback((seconds) => {
    setPendingSeekSec(Math.max(0, seconds));
  }, []);

  const getCurrentTime = useCallback(() => {
    const videoEl = playerContainerRef.current?.querySelector("video");
    return videoEl ? Math.floor(videoEl.currentTime || 0) : 0;
  }, []);

  return {
    playerContainerRef,
    showResumeDialog,
    setShowResumeDialog,
    handleResume,
    handleRestart,
    savedPos,
    durationForDialog: currentProgress?.durationSec || lectureDurationSec || 0,
    showConclusionDialog,
    setShowConclusionDialog,
    seekTo,
    getCurrentTime,
  };
}