// app/pages/course/video-player/components/VideoPlayerDetail.jsx
import { useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import { Collapse, Row, Spinner } from "react-bootstrap";
import Plyr from "plyr-react";
import { useVideoStream } from "@/hooks/useStreamUrl";
import useLectureTracking from "@/hooks/useLearningProgress";
import "plyr-react/plyr.css";

import Playlist from "./Playlist";
import { toPlyrSource, parseYouTubeId } from "@/utils/plyrSource";

export default function VideoPlayerDetail({
  course,
  loading,
  error,
  courseId,
  lectureId,
}) {
  const { isTrue: isOpen, toggle } = useToggle(true);
  const navigate = useNavigate();

  // 🎯 ref tới container bao quanh Plyr
  const playerContainerRef = useRef(null);

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

  // ====== 🔥 Tracking hook ======
  const lectureDurationSec =
    typeof current?.duration === "number" ? current.duration : undefined;

  const {
    reportTimeUpdate,
    reportCompleted,
    resetTracking,
  } = useLectureTracking({
    courseId,
    lectureId: current?._id,
    durationSec: lectureDurationSec,
  });

  // Reset khi đổi lecture
  useEffect(() => {
    if (!current?._id) return;
    resetTracking();
    console.log("[useLectureTracking] resetTracking for", {
      courseId,
      lectureId: current._id,
    });
  }, [courseId, current?._id, resetTracking]);

  // ====== 🎯 Gắn listener trực tiếp lên <video> bên trong Plyr ======
  useEffect(() => {
    // nếu chưa có lecture hoặc chưa có source thì thôi
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

    console.log("[VideoPlayerDetail] ✅ Attach native video events", {
      lectureId: current?._id,
      readyState: videoEl.readyState,
    });

    const handleTime = () => {
      const t = videoEl.currentTime || 0;
      const dur = videoEl.duration || 0;

      console.log(
        "%c[video timeupdate]",
        "color: #4ea1ff; font-weight: bold;",
        { time: t, duration: dur, lectureId: current?._id }
      );

      reportTimeUpdate(t);
    };

    const handleEnded = () => {
      const durationFromPlayer = videoEl.duration || 0;
      const t = videoEl.currentTime || durationFromPlayer || 0;

      console.log(
        "%c[video ended]",
        "color: #ff6f61; font-weight: bold;",
        { finalTime: t, durationFromPlayer, lectureId: current?._id }
      );

      reportCompleted(t, durationFromPlayer);
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
  }, [reportTimeUpdate, reportCompleted, current?._id, playerKey, source]);

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
  ]);

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
            <div
              className="video-player rounded-3"
              ref={playerContainerRef}
            >
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
                  currentId={current?._id}
                  onSelect={(lec) =>
                    navigate(`/courses/${courseId}/watch/${lec._id}`)
                  }
                />
              </div>
            </Collapse>
          </div>
        </div>
      </Row>
    </section>
  );
}
