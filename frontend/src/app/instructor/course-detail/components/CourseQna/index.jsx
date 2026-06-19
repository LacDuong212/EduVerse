import { useEffect, useState } from "react";
import { Col, Form, Pagination, Spinner } from "react-bootstrap";
import { authApi } from "@/utils/api";
import useQna from "@/app/student/learning/hooks/useQna";
import QnaCompose from "@/app/student/learning/components/QnaCompose";
import QnaQuestion from "@/app/student/learning/components/QnaQuestion";

function useCurriculumSections(courseId) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    authApi
      .get(`/instructor/courses/${courseId}`)
      .then(({ data }) => {
        if (data?.success) setSections(data.result?.curriculum?.sections || []);
      })
      .catch(() => {});
  }, [courseId]);

  return sections;
}

export default function CourseQna({ courseId, col = 12 }) {
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
  } = useQna({ courseId });

  const sections = useCurriculumSections(courseId);

  const [selectedLectureId, setSelectedLectureId] = useState("");

  // lectureId → "Section title — Lecture title"
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

  const handleNewQuestion = (content) => postQuestion({ content });

  return (
    <Col xs={12} lg={col}>
      <div className="card border">
        <div className="card-header border-bottom d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <h5 className="card-title mb-0">Q&amp;A</h5>

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
        </div>

        <div className="card-body gap-4">
          {/* Compose */}
          <div>
            <h6 className="mb-2">Ask a question</h6>
            <QnaCompose
              submitLabel="Post"
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
              No questions yet for this course.
            </p>
          ) : (
            <div className="gap-3">
              {questions.map((q) => (
                <QnaQuestion
                  key={q.id}
                  question={q}
                  lectureLabel={
                    q.lectureId ? (lecturesMap[q.lectureId] ?? null) : null
                  }
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
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((p) => (
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
      </div>
    </Col>
  );
}
