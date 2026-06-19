import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function NoteProgressMarkers({ notes, playerContainerRef, playerKey }) {
  const [progressEl, setProgressEl] = useState(null);
  const [duration, setDuration] = useState(0);

  // Re-find .plyr__progress whenever the player remounts (playerKey change)
  useEffect(() => {
    setProgressEl(null);
    if (!playerContainerRef?.current) return;
    let id;
    const tryFind = () => {
      const el = playerContainerRef.current?.querySelector(".plyr__progress");
      if (el) setProgressEl(el);
      else id = setTimeout(tryFind, 300);
    };
    tryFind();
    return () => clearTimeout(id);
  }, [playerContainerRef, playerKey]);

  // Track video duration — also reset on player remount
  useEffect(() => {
    setDuration(0);
    const video = playerContainerRef?.current?.querySelector("video");
    if (!video) return;
    const onUpdate = () => setDuration(video.duration || 0);
    video.addEventListener("loadedmetadata", onUpdate);
    video.addEventListener("durationchange", onUpdate);
    if (video.readyState >= 1) onUpdate();
    return () => {
      video.removeEventListener("loadedmetadata", onUpdate);
      video.removeEventListener("durationchange", onUpdate);
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
            style={{
              position: "absolute",
              left: `${pct}%`,
              top: 0,
              bottom: 0,
              width: 3,
              transform: "translateX(-50%)",
              backgroundColor: "#fbbf24",
              borderRadius: 2,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        );
      })}
    </>,
    progressEl
  );
}
