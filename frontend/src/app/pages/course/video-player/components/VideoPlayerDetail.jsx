// app/pages/course/video-player/components/VideoPlayerDetail.jsx
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import { Collapse, Row, Spinner } from "react-bootstrap";
import Plyr from "plyr-react";
import { useVideoStream } from '@/hooks/useStreamUrl';

import "plyr-react/plyr.css";
import Playlist from "./Playlist";
import { toPlyrSource, parseYouTubeId } from "@/utils/plyrSource";
export default function VideoPlayerDetail({ course, loading, error, courseId, lectureId }) {
  // UI toggle giống template
  const { isTrue: isOpen, toggle } = useToggle(true);
  const navigate = useNavigate();

  // Chuẩn hóa dữ liệu lectures
  const lectures = useMemo(
    () => (course?.curriculum ? course.curriculum.flatMap((s) => s.lectures || []) : []),
    [course]
  );

  // Chọn bài hiện tại (ưu tiên lectureId → free → preview)
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
          }
        : null)
    );
  }, [course, lectures, lectureId]);

  // video source gốc (key S3 hoặc URL youtube, v.v.)
  const rawVideoSource = current?.videoUrl || null;

  // 🔥 Dùng hook stream URL
  // - Nếu rawVideoSource là URL http(s) → hook trả lại chính URL đó (không gọi backend)
  // - Nếu là key kiểu "videos/....mp4" → hook gọi backend → streamUrl là S3 signed URL
  const {
    streamUrl,
    loading: streamLoading,
    error: streamError,
  } = useVideoStream(courseId, rawVideoSource);

  // Xác định provider để fingerprint chắc chắn
  const provider = useMemo(() => {
    const urlForDetect = streamUrl || rawVideoSource;
    const yt = urlForDetect ? parseYouTubeId(urlForDetect) : null;
    return yt ? "yt" : "html5";
  }, [streamUrl, rawVideoSource]);

  // Nguồn phát Plyr (YouTube/mp4) dựa trên URL cuối cùng
  const source = useMemo(() => {
    if (!current || !course) return null;

    // với YouTube: dùng URL (streamUrl hoặc raw) → parseYouTubeId sẽ xử lý được
    // với HTML5: bắt buộc phải có streamUrl (URL S3 signed)
    const effectiveUrl =
      provider === "yt"
        ? streamUrl || rawVideoSource
        : streamUrl;

    if (!effectiveUrl) return null;

    return toPlyrSource(
      effectiveUrl,
      current.title || course.title,
      course.thumbnail
    );
  }, [current, course, provider, streamUrl, rawVideoSource]);

  // Fingerprint cho key => ép Plyr remount “đủ sâu” mỗi khi đổi bài/nguồn
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

  // Log hỗ trợ debug (tắt nếu muốn)
  useEffect(() => {
    if (current) {
      // eslint-disable-next-line no-console
      console.log({
        from: "VideoPlayerDetail",
        params: { courseId, lectureId },
        lecturesLen: lectures.length,
        current,
        provider,
        rawVideoSource,
        stream: { streamUrl, streamLoading, streamError },
        source,
        playerKey,
      });
    }
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

  // UI trạng thái (giữ đúng layout full-screen)
  const overlayStatus =
    loading || streamLoading ? ( // 🔥 thêm loading video từ hook
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="light" />
      </div>
    ) : error || streamError ? ( // 🔥 merge error course + error video
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
            <div className="video-player rounded-3">
              {/* Tracks (caption) nếu có, có thể nối thêm vào source */}
              {source && (
                <Plyr
                  key={playerKey} // 👈 Key đổi theo fingerprint (lecture + provider + url/id)
                  playsInline
                  crossOrigin="anonymous"
                  controls
                  source={source}
                />
              )}
            </div>
            {overlayStatus}
          </div>

          {/* RIGHT: Sidebar toggle + collapse */}
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

            <Collapse className="collapse-horizontal" in={isOpen} dimension="width">
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