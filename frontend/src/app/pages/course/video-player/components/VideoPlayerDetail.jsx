// app/pages/course/video-player/components/VideoPlayerDetail.jsx
import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import { Collapse, Row, Spinner } from "react-bootstrap";
import Plyr from "plyr-react";
import { useVideoStream } from "@/hooks/useStreamUrl";
import useLectureTracking from "@/hooks/useLearningProgress";
import "plyr-react/plyr.css";
import useCourseProgress from "../../../../../hooks/useCourseProgress";

import Playlist from "./Playlist";
import { toPlyrSource, parseYouTubeId } from "@/utils/plyrSource";
import ResumeProgressDialog from "./ResumeProgressDialog";

export default function VideoPlayerDetail({
  course,
  loading,
  error,
  courseId,
  lectureId,
}) {
  const [resumeShownForLectureId, setResumeShownForLectureId] = useState(null);

  const { isTrue: isOpen, toggle } = useToggle(true);
  const navigate = useNavigate();

  const { progress } = useCourseProgress(courseId);

  // 🎯 ref tới container bao quanh Plyr
  const playerContainerRef = useRef(null);

  // local override để UI đổi trạng thái ngay lập tức
  const [localProgressOverrides, setLocalProgressOverrides] = useState({});

  // dialog chọn resume / restart
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  // thời điểm cần seek (0 hoặc savedPos) sau khi user chọn
  const [pendingSeekSec, setPendingSeekSec] = useState(null);

  // ----- Chuẩn hóa lectures -----
  const lectures = useMemo(
    () =>
      course?.curriculum
        ? course.curriculum.flatMap((s) => s.lectures || [])
        : [],
    [course]
  );

  // ----- Chọn lecture hiện tại -----
  const current = useMemo(() => {
    if (!course) return null;

    return (
      lectures.find((l) => l._id === lectureId) ||
      lectures.find((l) => l.isFree) ||
      (course.previewVideo
        ? {
            _id: "preview",
            title: course.title,
            videoUrl: course.previewVideo,
            isFree: true,
            duration: course.duration, // optional
          }
        : null)
    );
  }, [course, lectures, lectureId]);

  const rawVideoSource = current?.videoUrl || null;

  // ----- Lấy stream URL -----
  const {
    streamUrl,
    loading: streamLoading,
    error: streamError,
  } = useVideoStream(courseId, rawVideoSource);

  // ----- Provider -----
  const provider = useMemo(() => {
    const urlForDetect = streamUrl || rawVideoSource;
    const yt = urlForDetect ? parseYouTubeId(urlForDetect) : null;
    return yt ? "yt" : "html5";
  }, [streamUrl, rawVideoSource]);

  // ----- Source cho Plyr -----
  const source = useMemo(() => {
    if (!current || !course) return null;

    const effectiveUrl =
      provider === "yt" ? streamUrl || rawVideoSource : streamUrl;

    if (!effectiveUrl) return null;

    return toPlyrSource(
      effectiveUrl,
      current.title || course.title,
      course.thumbnail
    );
  }, [current, course, provider, streamUrl, rawVideoSource]);

  // ----- Key để ép Plyr remount khi đổi lecture/source -----
  const playerKey = useMemo(() => {
    const baseUrl =
      provider === "yt"
        ? streamUrl || rawVideoSource
        : streamUrl || rawVideoSource;

    const ytId = baseUrl ? parseYouTubeId(baseUrl) : null;

    return [
      courseId || "no-course",
      current?._id || "no-lecture",
      provider,
      ytId || baseUrl || "no-src",
    ].join("|");
  }, [courseId, current?._id, provider, streamUrl, rawVideoSource]);

  // ====== Merge progress: server + local override ======
  const lectureProgressMap = useMemo(() => {
    const serverMap = {};
    const finalMap = {};

    // 1) từ server
    if (progress?.lectures && Array.isArray(progress.lectures)) {
      for (const lec of progress.lectures) {
        const key =
          typeof lec.lectureId === "string"
            ? lec.lectureId
            : lec.lectureId?.toString?.() ?? "";
        if (!key) continue;
        serverMap[key] = lec;
        finalMap[key] = { ...lec };
      }
    }

    // 2) local override
    Object.entries(localProgressOverrides || {}).forEach(
      ([lecId, override]) => {
        const server = serverMap[lecId] || {};
        const merged = {
          ...server,
          ...override,
        };

        // ❗ RULE: nếu server đã completed rồi thì KHÔNG bao giờ downgrade
        if (server?.status === "completed") {
          merged.status = "completed";
          if (
            typeof server.durationSec === "number" &&
            typeof override?.durationSec === "number"
          ) {
            merged.durationSec = Math.max(
              server.durationSec,
              override.durationSec
            );
          }
        }

        finalMap[lecId] = merged;
      }
    );

    return finalMap;
  }, [progress, localProgressOverrides]);

  // 🔎 Progress của lecture hiện tại (nếu có)
  const currentProgress = useMemo(() => {
    if (!current?._id) return null;
    return (
      lectureProgressMap?.[current._id] ||
      lectureProgressMap?.[current._id?.toString?.()] ||
      null
    );
  }, [lectureProgressMap, current?._id]);

  const lectureDurationSec =
    typeof current?.duration === "number" ? current.duration : undefined;

  // ====== Tracking hook ======
  const {
    reportTimeUpdate,
    reportCompleted,
    resetTracking,
  } = useLectureTracking({
    courseId,
    lectureId: current?._id,
    durationSec: lectureDurationSec,
    initialStatus: currentProgress?.status, // để disable tracking nếu đã completed
  });

  // Reset khi đổi lecture
  useEffect(() => {
    if (!current?._id) return;
    resetTracking();
    console.log("[useLectureTracking] resetTracking for", {
      courseId,
      lectureId: current._id,
    });

    setLocalProgressOverrides((prev) => ({
      ...prev,
      [current._id]: prev[current._id] || {},
    }));
  }, [courseId, current?._id, resetTracking]);

  // ====== Hỏi user có muốn resume nếu đang dở (không áp dụng cho completed) ======
 // ====== Hỏi user có muốn resume nếu đang dở (CHỈ 1 LẦN / lecture) ======
// ====== Hỏi user có muốn resume nếu đang dở (CHỈ từ lần thứ 2 trở đi) ======
useEffect(() => {
  if (!current?._id) return;

  // Nếu lecture này đã show dialog trong lần vào hiện tại rồi thì không show lại nữa
  if (resumeShownForLectureId === current._id) {
    return;
  }

  const savedPos =
    typeof currentProgress?.lastPositionSec === "number"
      ? currentProgress.lastPositionSec
      : 0;

  const isCompleted = currentProgress?.status === "completed";
  const viewCount =
    typeof currentProgress?.viewCount === "number"
      ? currentProgress.viewCount
      : 0;

  // Chỉ show dialog nếu:
  // - Có progress > 0
  // - Chưa completed
  // - ĐÂY KHÔNG PHẢI LẦN ĐẦU (viewCount > 1)
  if (savedPos > 0 && !isCompleted && viewCount > 1) {
    setShowResumeDialog(true);
    setResumeShownForLectureId(current._id); // đánh dấu đã show cho lecture này
  } else {
    // lần đầu hoặc chưa có progress thì đảm bảo dialog tắt
    setShowResumeDialog(false);
  }
}, [
  current?._id,
  currentProgress?.status,
  currentProgress?.lastPositionSec,
  currentProgress?.viewCount,
  resumeShownForLectureId,
]);

  // ====== Attach native video events (tracking) ======
  useEffect(() => {
    if (!current?._id || !source) {
      console.log("[VideoPlayerDetail] SKIP attach: no current or source", {
        lectureId: current?._id,
        hasSource: !!source,
      });
      return;
    }

    const container = playerContainerRef.current;
    if (!container) {
      console.log("[VideoPlayerDetail] ❌ No container for tracking", {
        lectureId: current?._id,
      });
      return;
    }

    const videoEl = container.querySelector("video");
    if (!videoEl) {
      console.log("[VideoPlayerDetail] ❌ No <video> element found", {
        lectureId: current?._id,
      });
      return;
    }

    const isAlreadyCompleted = currentProgress?.status === "completed";

    // progress đã lưu từ BE (nếu có)
    const previousPosition =
      typeof currentProgress?.lastPositionSec === "number"
        ? currentProgress.lastPositionSec
        : 0;

    console.log("[VideoPlayerDetail] ✅ Attach native video events", {
      lectureId: current?._id,
      readyState: videoEl.readyState,
      currentProgress,
      isAlreadyCompleted,
      previousPosition,
    });

    const handleTime = () => {
      const t = videoEl.currentTime || 0;
      const dur = videoEl.duration || lectureDurationSec || 0;

      // ⛔ lecture completed → chỉ xem lại, không track nữa
      if (isAlreadyCompleted) return;

      // ⛔ sau F5, đang ở đoạn <= previousPosition → không override / không gửi
      if (t <= previousPosition) {
        return;
      }

      console.log(
        "%c[video timeupdate]",
        "color: #4ea1ff; font-weight: bold;",
        { time: t, duration: dur, lectureId: current?._id, previousPosition }
      );

      reportTimeUpdate(t);

      if (current?._id && dur > 0) {
        setLocalProgressOverrides((prev) => ({
          ...prev,
          [current._id]: {
            ...(prev[current._id] || {}),
            status: "in_progress",
            lastPositionSec: t,
            durationSec: dur,
          },
        }));
      }
    };

    const handleEnded = () => {
      const durationFromPlayer = videoEl.duration || lectureDurationSec || 0;
      const t = videoEl.currentTime || durationFromPlayer || 0;

      console.log(
        "%c[video ended]",
        "color: #ff6f61; font-weight: bold;",
        { finalTime: t, durationFromPlayer, lectureId: current?._id }
      );

      if (!isAlreadyCompleted) {
        reportCompleted(t, durationFromPlayer);
      }

      if (current?._id) {
        const finalDur = durationFromPlayer || t || lectureDurationSec || 0;
        setLocalProgressOverrides((prev) => ({
          ...prev,
          [current._id]: {
            ...(prev[current._id] || {}),
            status: "completed",
            lastPositionSec: finalDur,
            durationSec: finalDur,
          },
        }));
      }
    };

    videoEl.addEventListener("timeupdate", handleTime);
    videoEl.addEventListener("ended", handleEnded);

    return () => {
      videoEl.removeEventListener("timeupdate", handleTime);
      videoEl.removeEventListener("ended", handleEnded);
      console.log("[VideoPlayerDetail] 🔁 Detach video events", {
        lectureId: current?._id,
      });
    };
  }, [
    reportTimeUpdate,
    reportCompleted,
    current?._id,
    playerKey,
    source,
    lectureDurationSec,
    currentProgress,
  ]);

  // ====== SEEK theo lựa chọn của user (resume / restart), KHÔNG autoplay ======
  useEffect(() => {
    if (pendingSeekSec == null) return;
    if (!current?._id) return;

    const container = playerContainerRef.current;
    if (!container) return;

    const videoEl = container.querySelector("video");
    if (!videoEl) return;

    const doSeek = () => {
      const duration = videoEl.duration || lectureDurationSec || 0;
      if (duration > 0) {
        const target = Math.max(
          0,
          Math.min(pendingSeekSec, Math.max(0, duration - 1))
        );
        console.log("[VideoPlayerDetail] SEEK (user choice)", {
          lectureId: current._id,
          pendingSeekSec,
          duration,
          target,
        });
        try {
          videoEl.currentTime = target;
        } catch (e) {
          console.warn("[VideoPlayerDetail] cannot seek video", e);
        } finally {
          setPendingSeekSec(null);
        }
      }
    };

    if (videoEl.readyState >= 1) {
      doSeek();
    } else {
      videoEl.addEventListener("loadedmetadata", doSeek);
      return () => {
        videoEl.removeEventListener("loadedmetadata", doSeek);
      };
    }
  }, [pendingSeekSec, lectureDurationSec, current?._id]);

  // ====== Debug tổng thể ======
  useEffect(() => {
    if (!current) return;
    console.log("[VideoPlayerDetail] debug", {
      params: { courseId, lectureId },
      lecturesLen: lectures.length,
      current,
      provider,
      rawVideoSource,
      stream: { streamUrl, streamLoading, streamError },
      source,
      playerKey,
      currentProgress,
    });
  }, [
    courseId,
    lectureId,
    lectures.length,
    current,
    provider,
    rawVideoSource,
    streamUrl,
    streamLoading,
    streamError,
    source,
    playerKey,
    currentProgress,
  ]);

  // 🔄 handler khi chọn lecture trong playlist
  const handleSelectLecture = useCallback(
    (lec) => {
      if (!lec?._id) return;
      navigate(`/courses/${courseId}/watch/${lec._id}`);
    },
    [navigate, courseId]
  );

  // ====== Data dùng cho dialog ======
  const savedPos =
    typeof currentProgress?.lastPositionSec === "number"
      ? currentProgress.lastPositionSec
      : 0;
  const durationFromProgress =
    typeof currentProgress?.durationSec === "number"
      ? currentProgress.durationSec
      : undefined;
  const durationForDialog = durationFromProgress ?? lectureDurationSec ?? 0;

  const handleResumeFromDialog = useCallback(() => {
    setShowResumeDialog(false);
    if (savedPos > 0) {
      setPendingSeekSec(savedPos); // effect seek sẽ xử lý
    }
  }, [savedPos]);

  const handleRestartFromDialog = useCallback(() => {
    setShowResumeDialog(false);
    setPendingSeekSec(0); // seek về 0

    if (current?._id) {
      setLocalProgressOverrides((prev) => ({
        ...prev,
        [current._id]: {
          ...(prev[current._id] || {}),
          status: "not_started",
          lastPositionSec: 0,
          durationSec: durationForDialog,
        },
      }));
    }
  }, [current?._id, durationForDialog]);

  // ====== Overlay trạng thái ======
  const overlayStatus =
    loading || streamLoading ? (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="light" />
      </div>
    ) : error || streamError ? (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-danger">
        {String(error || streamError)}
      </div>
    ) : !course ? (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-light">
        No course
      </div>
    ) : !current || !source ? (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-light">
        No video
      </div>
    ) : null;

  return (
    <section className="py-0 bg-dark position-relative min-vh-100">
      <Row className="g-0">
        <div className="d-flex w-100">
          {/* LEFT: Player */}
          <div className="overflow-hidden fullscreen-video w-100 position-relative">
            {/* 👇 Container có ref để query <video> */}
            <div className="video-player rounded-3" ref={playerContainerRef}>
              {source && (
                <Plyr
                  key={playerKey}
                  playsInline
                  crossOrigin="anonymous"
                  controls
                  source={source}
                />
              )}
            </div>
            {overlayStatus}
          </div>

          {/* RIGHT: Sidebar + playlist */}
          <div className="justify-content-end position-relative">
            <button
              onClick={toggle}
              className="navbar-toggler btn btn-white mt-4 plyr-toggler"
              type="button"
              aria-expanded={isOpen}
            >
              <span className="navbar-toggler-animation">
                <span />
                <span />
                <span />
              </span>
            </button>

            <Collapse
              className="collapse-horizontal"
              in={isOpen}
              dimension="width"
            >
              <div>
                <Playlist
                  course={course}
                  onSelect={handleSelectLecture}
                  currentId={lectureId}
                  lectureProgress={lectureProgressMap} // ✅ đã merge local + server
                />
              </div>
            </Collapse>
          </div>
        </div>
      </Row>

      {/* Dialog hỏi Resume / Restart */}
      <ResumeProgressDialog
        show={showResumeDialog}
        onClose={() => setShowResumeDialog(false)}
        onResume={handleResumeFromDialog}
        onRestart={handleRestartFromDialog}
        savedSeconds={savedPos}
        durationSeconds={durationForDialog}
      />
    </section>
  );
}
