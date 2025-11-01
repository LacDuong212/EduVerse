// app/pages/course/video-player/components/VideoPlayerDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import { Collapse, Row, Spinner } from "react-bootstrap";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import Playlist from "./Playlist";
import { toPlyrSource, parseYouTubeId } from "@/utils/plyrSource";

export default function VideoPlayerDetail({ course, loading, error, courseId, lectureId }) {
  // UI toggle giống template
  const { isTrue: isOpen, toggle } = useToggle(true);
  const navigate = useNavigate();

  // Chuẩn hóa dữ liệu (không return sớm trước hooks)
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
        ? { _id: "preview", title: course.title, videoUrl: course.previewVideo, isFree: true }
        : null)
    );
  }, [course, lectures, lectureId]);

  // Nguồn phát Plyr (YouTube/mp4)
  const source = useMemo(() => {
    if (!current || !course) return null;
    return toPlyrSource(current.videoUrl, current.title || course.title, course.thumbnail);
  }, [current, course]);

  // Remount Plyr khi đổi lecture để tránh lỗi removeChild
  const [playerKey, setPlayerKey] = useState(0);
  useEffect(() => {
    setPlayerKey((k) => k + 1);
  }, [lectureId]);

  // Log hỗ trợ debug (tắt nếu muốn)
  useEffect(() => {
    if (current) {
      console.log({
        from: "VideoPlayerDetail",
        params: { courseId, lectureId },
        lecturesLen: lectures.length,
        current,
        ytId: current?.videoUrl ? parseYouTubeId(current.videoUrl) : null,
        source,
      });
    }
  }, [courseId, lectureId, lectures.length, current, source]);

  // UI trạng thái (giữ đúng layout full-screen)
  const overlayStatus =
    loading ? (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="light" />
      </div>
    ) : error ? (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-danger">
        {String(error)}
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
          {/* LEFT: Player – y hệt template, chỉ thay source động */}
          <div className="overflow-hidden fullscreen-video w-100 position-relative">
            <div className="video-player rounded-3">
              {/* Tracks (caption) nếu có, bạn có thể thêm vào toPlyrSource hoặc nối ở đây */}
              {source && <Plyr key={playerKey} playsInline crossOrigin="anonymous" controls source={source} />}
            </div>
            {overlayStatus}
          </div>

          {/* RIGHT: Sidebar toggle + collapse (animation) */}
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
                  onSelect={(lec) => navigate(`/courses/${courseId}/watch/${lec._id}`)}
                />
              </div>
            </Collapse>
          </div>
        </div>
      </Row>
    </section>
  );
}
