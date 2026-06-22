import { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import QnaCompose from "@/app/student/learning/components/QnaCompose";
import QnaQuestion from "@/app/student/learning/components/QnaQuestion";
import useQna from "@/app/student/learning/hooks/useQna";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { authApi } from "@/utils/api";

function useCurriculumSections(courseId) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    authApi
      .get(`/instructor/courses/${courseId}`)
      .then(({ data }) => {
        if (data?.success) setSections(data.result?.curriculum?.sections || []);
      })
      .catch(() => { });
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
        <div className="card-header border-bottom bg-light">
          <Row className="align-items-center">
            <Col xs={12} sm={3} md={4} lg={5}>
              <h5 className="card-title mb-0">Q&amp;A</h5>
            </Col>
            <Col xs={12} sm={9} md={8} lg={7}>
              {sections.length > 0 && (
                <ChoicesFormInput
                  name="lectureIdSelect"
                  className="w-100"
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
                </ChoicesFormInput>
              )}
            </Col>
          </Row>
        </div>

        <div className="card-body gap-4">
          <div>
            <h6 className="mb-2">Ask a question</h6>
            <QnaCompose
              submitLabel="Post"
              onSubmit={handleNewQuestion}
              disabled={submitting}
            />
          </div>

          <hr className="my-0" />

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
        </div>

        <div className="card-footer bg-light border-top p-2">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">

            <p className="mb-0 text-center text-sm-start ps-2">
              Showing {Math.min((page - 1) * (pagination.limit || 10) + 1, pagination.totalItems || 0)} to{" "}
              {Math.min(page * (pagination.limit || 10), pagination.totalItems || 0)} of{" "}
              {pagination.totalItems || 0} Q&A
            </p>

            <nav aria-label="navigation" className="d-flex justify-content-center mb-0">
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li className={`page-item mb-0 ${!pagination.hasPrevPage ? "disabled" : ""}`}>
                  <Button
                    className="page-link mb-0"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <FaAngleLeft />
                  </Button>
                </li>

                {[...Array(pagination.totalPages)].map((_, i) => (
                  <li key={i} className={`page-item mb-0 ${page === i + 1 ? "active" : ""}`}>
                    <Button className="page-link mb-0" onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </Button>
                  </li>
                ))}

                <li className={`page-item mb-0 ${!pagination.hasNextPage ? "disabled" : ""}`}>
                  <Button
                    className="page-link mb-0"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <FaAngleRight />
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </Col>
  );
}