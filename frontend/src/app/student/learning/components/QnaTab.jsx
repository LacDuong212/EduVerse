import { useState } from "react";
import { Form, Pagination, Spinner } from "react-bootstrap";
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

  // Map lectureId → display label for the tag on each question card
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
    postQuestion({ content, lectureId: selectedLectureId || null });

  return (
    <div className="gap-4">
      {/* Lecture filter */}
      {sections.length > 0 && (
        <Form.Select
          size="sm"
          style={{ maxWidth: 340 }}
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
      )}

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
          No questions yet. Be the first to ask!
        </p>
      ) : (
        <div className="gap-3">
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(page - 1)}
            />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <Pagination.Item
                  key={p}
                  active={p === page}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </Pagination.Item>
              )
            )}
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
