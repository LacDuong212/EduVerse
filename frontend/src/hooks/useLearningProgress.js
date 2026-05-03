  import { useCallback, useRef, useEffect } from "react";
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
    }, [initialStatus, courseId, lectureId]);

    const sendUpdate = useCallback(
      async ({ currentTimeSec, isCompleted = false, durationOverride }) => {
        if (!backendUrl || !courseId || !lectureId) {
          console.log("[useLectureTracking] SKIP send: missing data", {
            hasBackend: !!backendUrl,
            courseId,
            lectureId,
          });
          return;
        }

        if (disabledRef.current && !isCompleted) {
          console.log(
            "[useLectureTracking] SKIP: lecture already completed, ignore timeupdate",
            { lectureId, currentTimeSec }
          );
          return;
        }

        const current = Math.max(0, Number(currentTimeSec) || 0);
        const last = lastReportedTimeRef.current || 0;
        const rawDelta = current - last;

        const safeDelta = rawDelta > 0 ? rawDelta : 0;

        let isNewSession =
          last === 0 && current > 0 && !isCompleted && !disabledRef.current;

        if (disabledRef.current) {
          isNewSession = false;
        }

        if (!isCompleted) {
          if (last === 0 && current === 0) {
            console.log("[useLectureTracking] SKIP (initial 0s)", {
              current,
              last,
            });
            return;
          }

          if (last > 0 && safeDelta < minDeltaSeconds) {
            console.log("[useLectureTracking] SKIP (delta < min)", {
              lectureId,
              lastReported: last,
              current,
              rawDelta,
              safeDelta,
              minDeltaSeconds,
            });
            return;
          }
        }

        if (safeDelta > 0) {
          lastReportedTimeRef.current = current;
        }

        const payload = {
          currentTimeSec: Math.round(current),
          durationSec: durationOverride ?? durationSec ?? 0,
          deltaTimeSec: safeDelta,
          isCompleted,
          isNewSession,
        };

        console.log("[useLectureTracking] SENDING", {
          url: `${backendUrl}/api/student/courses/${courseId}/lectures/${lectureId}/progress`,
          payload,
        });

        try {
          await axios.post(
            `${backendUrl}/api/student/courses/${courseId}/lectures/${lectureId}/progress`,
            payload,
            { withCredentials: true }
          );
          console.log("[useLectureTracking] DONE");
        } catch (err) {
          console.error("update lecture progress error:", err);
        }
      },
      [courseId, lectureId, durationSec, minDeltaSeconds]
    );

    const reportTimeUpdate = useCallback(
      (currentTimeSec) => {
        console.log("[useLectureTracking] reportTimeUpdate", { currentTimeSec });
        return sendUpdate({ currentTimeSec, isCompleted: false });
      },
      [sendUpdate]
    );

    const reportCompleted = useCallback(
      (currentTimeSec, playerDurationSec) => {
        const durationOverride =
          durationSec || playerDurationSec || currentTimeSec;

        console.log("[useLectureTracking] reportCompleted", {
          currentTimeSec,
          durationOverride,
        });

        return sendUpdate({
          currentTimeSec,
          isCompleted: true,
          durationOverride,
        });
      },
      [sendUpdate, durationSec]
    );

    const resetTracking = useCallback(() => {
      console.log("[useLectureTracking] resetTracking");
      lastReportedTimeRef.current = 0;
    }, []);

    return {
      reportTimeUpdate,
      reportCompleted,
      resetTracking,
    };
  }
