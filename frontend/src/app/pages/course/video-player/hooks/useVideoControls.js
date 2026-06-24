import { useEffect } from "react";

const SEEK_SECS = 5;

/**
 * Global keyboard shortcuts for the video player.
 * - Space: toggle play/pause
 * - ←: seek -5s
 * - →: seek +5s
 *
 * Skips when focus is on an input/textarea/contenteditable,
 * or when the Plyr container itself has focus (Plyr's own shortcuts take over).
 */
export default function useVideoControls(playerContainerRef) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (document.activeElement?.isContentEditable) return;

      // Let Plyr handle events when its container has focus
      const plyrEl = playerContainerRef.current?.querySelector(".plyr");
      if (plyrEl?.contains(document.activeElement)) return;

      const videoEl = playerContainerRef.current?.querySelector("video");
      if (!videoEl) return;

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        videoEl.paused ? videoEl.play() : videoEl.pause();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        videoEl.currentTime = Math.max(0, videoEl.currentTime - SEEK_SECS);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        videoEl.currentTime = Math.min(
          videoEl.duration || Infinity,
          videoEl.currentTime + SEEK_SECS
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [playerContainerRef]);
}
