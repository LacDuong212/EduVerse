import { Modal, Spinner } from "react-bootstrap";
import useQna from "../hooks/useQna";
import QnaCompose from "./QnaCompose";
import QnaQuestion from "./QnaQuestion";

export default function QnaModal({ show, onHide, lectureId, lectureTitle }) {
  const {
    questions,
    loading,
    submitting,
    postQuestion,
    postReply,
    deleteQna,
    toggleResolve,
  } = useQna({ fixedLectureId: lectureId });

  const handleNewQuestion = (content) => postQuestion({ content });

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6">
          Q&amp;A
          {lectureTitle && (
            <span className="text-body fw-normal opacity-50 ms-2 small">
              — {lectureTitle}
            </span>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="gap-4 p-4">
        {/* New question compose */}
        <div>
          <h6 className="mb-2">Ask a question</h6>
          <QnaCompose
            submitLabel="Post Question"
            onSubmit={handleNewQuestion}
            disabled={submitting}
          />
        </div>

        <hr className="my-0" />

        {/* Questions list */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : questions.length === 0 ? (
          <p className="text-body text-center py-4 mb-0 opacity-50">
            No questions for this lecture yet. Be the first to ask!
          </p>
        ) : (
          <div className="gap-3">
            {questions.map((q) => (
              <QnaQuestion
                key={q.id}
                question={q}
                lectureLabel={null}
                onReply={postReply}
                onDelete={(id) => deleteQna(id, null)}
                onDeleteReply={(id, parentId) => deleteQna(id, parentId)}
                onToggleResolve={toggleResolve}
                submitting={submitting}
              />
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
