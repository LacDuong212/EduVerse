// app/pages/course/video-player/components/ResumeProgressDialog.jsx
import { Modal, Button, ProgressBar } from "react-bootstrap";

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "--:--";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Props:
 * - show: boolean
 * - onClose: () => void
 * - onResume: () => void      // tiếp tục từ progress
 * - onRestart: () => void     // học lại từ đầu
 * - savedSeconds?: number     // lastPositionSec từ progress
 * - durationSeconds?: number  // duration video (nếu có)
 */
export default function ResumeProgressDialog({
  show,
  onClose,
  onResume,
  onRestart,
  savedSeconds = 0,
  durationSeconds = 0,
}) {
  let percent = 0;
  if (durationSeconds > 0 && savedSeconds > 0) {
    percent = Math.round((savedSeconds / durationSeconds) * 100);
  }

  if (percent > 100) percent = 100;
  if (percent < 0 || !Number.isFinite(percent)) percent = 0;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tiếp tục học?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-2">
          Bạn đã học bài này khoảng{" "}
          <strong>{percent}%</strong>{" "}
          ({formatTime(savedSeconds)} / {formatTime(durationSeconds)}).
        </p>
        <p className="mb-3">
          Bạn muốn <strong>tiếp tục từ vị trí này</strong> hay{" "}
          <strong>bắt đầu lại từ đầu</strong>?
        </p>

        <ProgressBar
          now={percent}
          label={`${percent}%`}
          visuallyHidden={percent === 0}
        />
      </Modal.Body>
      <Modal.Footer>
        
        <Button variant="outline-danger" onClick={onRestart}>
          Học lại từ đầu
        </Button>
        <Button variant="primary" onClick={onResume}>
          Tiếp tục học
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
