import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function NoteProgressMarkers({ notes, playerContainerRef, playerKey }) {
  const [progressEl, setProgressEl] = useState(null);
  const [duration, setDuration] = useState(0);

  // Single effect: retry until both .plyr__progress AND <video> are found.
  // Plyr initialises asynchronously so either element may be absent on first run.
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

      // Video may already be loaded by the time we attach
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

  if (!progressEl || duration <= 0 || !notes?.length) return null;

  return createPortal(
    <>
      {notes.map((note) => {
        const pct = Math.min(98, Math.max(2, (note.timestamp / duration) * 100));
        return (
          <div
            key={note.id}
            title={`Note at ${Math.floor(note.timestamp / 60)}:${String(Math.floor(note.timestamp % 60)).padStart(2, "0")}`}
            style={{
              position: "absolute",
              left: `${pct}%`,
              top: "50%",
              width: 8,
              height: 8,
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fde68a",
              borderRadius: "50%",
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
