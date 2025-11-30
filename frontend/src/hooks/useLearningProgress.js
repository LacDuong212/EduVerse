import { useCallback, useRef } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useLectureTracking({
  courseId,
  lectureId,
  durationSec,
  minDeltaSeconds = 5, // ⬅️ mỗi 5s mới gửi 1 lần
} = {}) {
  const lastReportedTimeRef = useRef(0);

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

      const current = Math.max(0, Number(currentTimeSec) || 0);
      const last = lastReportedTimeRef.current || 0;
      const rawDelta = current - last;

      console.log("[useLectureTracking] ENTER sendUpdate", {
        backendUrl,
        courseId,
        lectureId,
        currentTimeSec: current,
        isCompleted,
      });

      // ⛔ Không cho delta âm (seek ngược, bug timeupdate)
      const safeDelta = rawDelta > 0 ? rawDelta : 0;
  const isNewSession = last === 0 && current > 0 && !isCompleted;
      if (!isCompleted) {
        // 1) Lần đầu, player đang ở 0s -> bỏ qua
        if (last === 0 && current === 0) {
          console.log("[useLectureTracking] SKIP (initial 0s)", {
            current,
            last,
          });
          return;
        }

        // 2) Chỉ gửi khi đã trôi ít nhất minDeltaSeconds
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

      // ✅ Chỉ khi QUYẾT ĐỊNH gửi mới update lastReported
      if (safeDelta > 0) {
        lastReportedTimeRef.current = current;
      }

      const deltaTimeSec = safeDelta; // để float cũng được, BE vẫn + bình thường

      console.log("[useLectureTracking] COMPUTED", {
        lectureId,
        lastReported: last,
        current,
        rawDelta,
        deltaTimeSec,
        isCompleted,
      });

      const payload = {
        currentTimeSec: Math.round(current), // vị trí cuối cùng: làm tròn
        durationSec: durationOverride ?? durationSec ?? 0,
        deltaTimeSec, // thời gian xem thêm: giữ float
        isCompleted,
        isNewSession,
      };

      console.log("[useLectureTracking] SENDING", {
        url: `${backendUrl}/api/courses/${courseId}/progress/lectures/${lectureId}`,
        payload,
      });

      try {
        await axios.post(
          `${backendUrl}/api/courses/${courseId}/progress/lectures/${lectureId}`,
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
        isCompleted: true, // ⬅️ bỏ qua minDelta, luôn gửi
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
