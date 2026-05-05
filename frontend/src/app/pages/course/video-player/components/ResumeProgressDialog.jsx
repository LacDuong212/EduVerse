import { Button, Modal, ProgressBar } from "react-bootstrap";

function formatTime(value) {
  const sec = Number(value);

  if (!Number.isFinite(sec) || sec <= 0) return "0:00";

  const totalSeconds = Math.floor(sec);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ResumeProgressDialog({
  show,
  onClose,
  onResume,
  onRestart,
  savedSeconds = 0,
  durationSeconds = 0,
}) {
  const saved = Math.max(0, Number(savedSeconds) || 0);
  const duration = Math.max(0, Number(durationSeconds) || 0);

  const percent =
    duration > 0
      ? Math.min(100, Math.max(0, Math.round((saved / duration) * 100)))
      : 0;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tiếp tục học?</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-2">
          Bạn đã học bài này đến <strong>{formatTime(saved)}</strong>
          {duration > 0 && (
            <>
              {" "}
              / <strong>{formatTime(duration)}</strong>, khoảng{" "}
              <strong>{percent}%</strong>.
            </>
          )}
        </p>

        <p className="mb-3">
          Bạn muốn <strong>tiếp tục từ vị trí này</strong> hay{" "}
          <strong>bắt đầu lại từ đầu</strong>?
        </p>

        {duration > 0 && <ProgressBar now={percent} label={`${percent}%`} />}
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