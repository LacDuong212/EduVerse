import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const secsToMMSS = (secs) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function QuizProgressMarkers({ quizzes, playerContainerRef, playerKey }) {
  const [progressEl, setProgressEl] = useState(null);
  const [duration, setDuration] = useState(0);

  const timestampQuizzes = (quizzes || [])
    .map((q, i) => ({ ...q, _idx: i }))
    .filter((q) => q.timestamp != null);

  useEffect(() => {
    setProgressEl(null);
    setDuration(0);
    if (!playerContainerRef?.current) return;

    let retryId;
    let removeListeners = () => {};

    const tryInit = () => {
      const container = playerContainerRef.current;
      if (!container) return;

      const plyrProgress = container.querySelector(".plyr__progress");
      const video = container.querySelector("video");

      if (!plyrProgress || !video) {
        retryId = setTimeout(tryInit, 200);
        return;
      }

      setProgressEl(plyrProgress);

      const onDuration = () => {
        if (video.duration > 0) setDuration(video.duration);
      };

      video.addEventListener("loadedmetadata", onDuration);
      video.addEventListener("durationchange", onDuration);

      if (video.readyState >= 1 && video.duration > 0) {
        setDuration(video.duration);
      }

      removeListeners = () => {
        video.removeEventListener("loadedmetadata", onDuration);
        video.removeEventListener("durationchange", onDuration);
      };
    };

    tryInit();

    return () => {
      clearTimeout(retryId);
      removeListeners();
    };
  }, [playerContainerRef, playerKey]);

  if (!progressEl || duration <= 0 || !timestampQuizzes.length) return null;

  return createPortal(
    <>
      {timestampQuizzes.map((q) => {
        const pct = Math.min(98, Math.max(2, (q.timestamp / duration) * 100));
        return (
          <div
            key={q._idx}
            title={`Quiz Q${q._idx + 1} at ${secsToMMSS(q.timestamp)}`}
            style={{
              position: "absolute",
              left: `${pct}%`,
              top: "50%",
              width: 10,
              height: 10,
              transform: "translate(-50%, -50%) rotate(45deg)",
              backgroundColor: "#7c3aed",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        );
      })}
    </>,
    progressEl
  );
}
