import { useCallback, useEffect, useRef } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useLectureTracking({
  courseId,
  lectureId,
  durationSec,
  minDeltaSeconds = 5,
  initialStatus,
} = {}) {
  const lastReportedTimeRef = useRef(0);
  const disabledRef = useRef(initialStatus === "completed");

  useEffect(() => {
    disabledRef.current = initialStatus === "completed";
    lastReportedTimeRef.current = 0;
  }, [initialStatus, courseId, lectureId]);

  const sendUpdate = useCallback(
    async ({ currentTimeSec, isCompleted = false, durationOverride }) => {
      if (!backendUrl || !courseId || !lectureId) return;

      if (disabledRef.current && !isCompleted) return;

      const current = Math.max(0, Number(currentTimeSec) || 0);
      const last = lastReportedTimeRef.current || 0;
      const rawDelta = current - last;
      const safeDelta = rawDelta > 0 ? rawDelta : 0;

      const finalDuration = Math.max(
        0,
        Number(durationOverride || durationSec || 0) || 0
      );

      let isNewSession =
        last === 0 && current > 0 && !isCompleted && !disabledRef.current;

      if (disabledRef.current) {
        isNewSession = false;
      }

      if (!isCompleted) {
        if (last === 0 && current === 0) return;
        if (last > 0 && safeDelta < minDeltaSeconds) return;
      }

      if (safeDelta > 0 || isCompleted) {
        lastReportedTimeRef.current = current;
      }

      const payload = {
        currentTimeSec: Math.round(current),
        durationSec: Math.round(finalDuration),
        deltaTimeSec: safeDelta,
        isCompleted,
        isNewSession,
      };

      try {
        await axios.post(
          `${backendUrl}/api/student/courses/${courseId}/lectures/${lectureId}/progress`,
          payload,
          { withCredentials: true }
        );

        if (isCompleted) {
          disabledRef.current = true;
        }
      } catch (err) {
        console.error("update lecture progress error:", err);
      }
    },
    [courseId, lectureId, durationSec, minDeltaSeconds]
  );

  const reportTimeUpdate = useCallback(
    (currentTimeSec, playerDurationSec) => {
      return sendUpdate({
        currentTimeSec,
        isCompleted: false,
        durationOverride: playerDurationSec,
      });
    },
    [sendUpdate]
  );

  const reportCompleted = useCallback(
    (currentTimeSec, playerDurationSec) => {
      return sendUpdate({
        currentTimeSec,
        isCompleted: true,
        durationOverride: playerDurationSec || durationSec || currentTimeSec,
      });
    },
    [sendUpdate, durationSec]
  );

  const resetTracking = useCallback(() => {
    lastReportedTimeRef.current = 0;
  }, []);

  return {
    reportTimeUpdate,
    reportCompleted,
    resetTracking,
  };
}