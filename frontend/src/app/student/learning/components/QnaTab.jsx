import { useState } from "react";
import { Form, Pagination, Spinner } from "react-bootstrap";
import { BsChatSquareText } from "react-icons/bs";
import useQna from "../hooks/useQna";
import QnaCompose from "./QnaCompose";
import QnaQuestion from "./QnaQuestion";

export default function QnaTab({ sections = [] }) {
  const {
    questions,
    loading,
    submitting,
    pagination,
    page,
    postQuestion,
    postReply,
    deleteQna,
    toggleResolve,
    changeLectureFilter,
    handlePageChange,
  } = useQna();

  const [selectedLectureId, setSelectedLectureId] = useState("");

  const lecturesMap = {};
  for (const sec of sections) {
    for (const lec of sec.lectures || []) {
      lecturesMap[lec.lecId] = `${sec.title} — ${lec.title}`;
    }
  }

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setSelectedLectureId(val);
    changeLectureFilter(val);
  };

  const handleNewQuestion = (content) =>
    postQuestion({ content, lectureId: null });

  return (
    <div className="vstack gap-5">

      {/* ── Filter ── */}
      {sections.length > 0 && (
        <div className="d-flex align-items-center gap-2">
          <span className="text-body small flex-shrink-0" style={{ opacity: 0.5 }}>
            Filter by lecture:
          </span>
          <Form.Select
            size="sm"
            style={{ maxWidth: 300 }}
            value={selectedLectureId}
            onChange={handleFilterChange}
          >
            <option value="">All lectures</option>
            {sections.map((sec) =>
              (sec.lectures || []).map((lec) => (
                <option key={lec.lecId} value={lec.lecId}>
                  {sec.title} — {lec.title}
                </option>
              ))
            )}
          </Form.Select>
        </div>
      )}

      {/* ── Compose ── */}
      <div>
        <div className="mb-4">
          <div className="fw-semibold text-body mb-1" style={{ fontSize: "0.95rem" }}>
            Ask a question
          </div>
          <div className="text-body small" style={{ opacity: 0.5 }}>
            Ask anything about the course — the instructor and fellow students can help.
          </div>
        </div>

        <QnaCompose
          submitLabel="Post Question"
          onSubmit={handleNewQuestion}
          disabled={submitting}
          placeholder="What would you like to know?"
        />
      </div>

      {/* ── Divider ── */}
      <div className="d-flex align-items-center gap-3">
        <div className="flex-grow-1" style={{ height: 1, background: "var(--bs-border-color)" }} />
        {!loading && questions.length > 0 && (
          <span
            className="text-body flex-shrink-0"
            style={{ opacity: 0.4, fontSize: "0.75rem" }}
          >
            {pagination.totalItems ?? questions.length} question
            {(pagination.totalItems ?? questions.length) !== 1 ? "s" : ""}
          </span>
        )}
        <div className="flex-grow-1" style={{ height: 1, background: "var(--bs-border-color)" }} />
      </div>

      {/* ── Questions ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" className="text-body opacity-50" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-5">
          <BsChatSquareText
            size={36}
            className="text-body mb-3"
            style={{ opacity: 0.2 }}
          />
          <div className="fw-semibold text-body mb-1">No questions yet</div>
          <div className="text-body small" style={{ opacity: 0.45 }}>
            Be the first to ask — your question might help others too.
          </div>
        </div>
      ) : (
        <div className="vstack gap-3">
          {questions.map((q) => (
            <QnaQuestion
              key={q.id}
              question={q}
              lectureLabel={q.lectureId ? lecturesMap[q.lectureId] : null}
              onReply={postReply}
              onDelete={(id) => deleteQna(id, null)}
              onDeleteReply={(id, parentId) => deleteQna(id, parentId)}
              onToggleResolve={toggleResolve}
              submitting={submitting}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center pt-2">
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(page - 1)}
            />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item
                key={p}
                active={p === page}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(page + 1)}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
}
