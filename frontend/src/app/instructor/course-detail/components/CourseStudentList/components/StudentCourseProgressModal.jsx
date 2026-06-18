import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Button, Badge, ProgressBar, Spinner, Alert, Accordion, Row, Col, Card, ListGroup } from "react-bootstrap";
import { FaBookOpen, FaCheckCircle, FaAward, FaTasks, FaRegClock } from "react-icons/fa";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";
import { DEFAULT_AVATAR_IMG } from "@/contexts/constants";

const StudentCourseProgressModal = ({ show, onClose, courseId, student }) => {
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show || !courseId || !student?.stuId) {
      setProgressData(null);
      setError("");
      return;
    }

    let cancelled = false;
    const fetchProgress = async () => {
      setLoading(true);
      setError("");
      setProgressData(null);

      const response = await handleRequest(
        authApi.get(`/instructor/courses/${courseId}/students/${student.stuId}/progress`)
      );

      if (cancelled) return;

      if (response?.success) {
        setProgressData(response.result?.courseProgress || null);
      } else {
        setError(response?.message || "Failed to load student progress.");
      }

      setLoading(false);
    };

    fetchProgress();

    return () => {
      cancelled = true;
    };
  }, [show, courseId, student?.stuId]);

  const sectionRows = progressData?.sections || [];

  const stats = {
    courseProgress: progressData?.courseProgress ?? 0,
    lectureCompleted: progressData?.lectureCompleted ?? 0,
    totalLectures: progressData?.totalLectures ?? 0,
    quizzCleared: progressData?.quizzCleared ?? 0,
    totalQuizzes: progressData?.totalQuizzes ?? 0,
    quizAccuracy: progressData?.quizAccuracy ?? 0,
  };

  const renderLecture = (lecture) => {
    const progressValue = lecture?.progress ?? 0;
    const quiz = lecture?.quiz || {};
    const hasQuiz = quiz?.totalQuestionsCount > 0;

    return (
      <ListGroup.Item key={lecture?.lecId || lecture?.title} className="p-3 border-start-0 border-end-0">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
          <h6 className="mb-0 fw-semibold">{lecture?.title || "Untitled lecture"}</h6>
          <div className="d-flex gap-2 flex-wrap">
            {hasQuiz && (
              <Badge bg={quiz?.isCompleted ? "info" : "secondary"} className="px-2 py-1">
                {quiz?.isCompleted ? "Quiz Done" : "Quiz Pending"}
              </Badge>
            )}
            <Badge bg={progressValue === 100 ? "success" : "warning"} className="px-2 py-1">
              {progressValue === 100 ? "Completed" : progressValue > 0 ? "In Progress" : "Not Started"}
            </Badge>
          </div>
        </div>

        <Row className="align-items-center g-2">
          <Col xs={12} sm={6}>
            <div className="d-flex justify-content-end mb-1 small">
              <span className="fw-bold">{progressValue}%</span>
            </div>
            <ProgressBar
              now={progressValue}
              variant={progressValue === 100 ? "success" : "primary"}
              style={{ height: "6px" }}
            />
          </Col>

          {hasQuiz && (
            <Col xs={12} sm={6} className="fw-semibold small ps-sm-4 border-start-sm">
              <div className="mb-1">Quiz Results</div>
              <div className="d-flex align-items-center gap-1">
                <span className={quiz?.isCompleted ? "text-success" : "text-danger"}>
                  {quiz?.isCompleted ? "Passed" : "Incomplete"}
                </span>
                {quiz?.isCompleted && (
                  <span className="fw-light">
                    ({quiz?.correctAnswersCount}/{quiz?.totalQuestionsCount} Correct)
                  </span>
                )}
              </div>
            </Col>
          )}
        </Row>
      </ListGroup.Item>
    );
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" size="lg" centered scrollable>
      <ModalHeader className="bg-dark border-bottom">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="avatar avatar-md flex-shrink-0">
            {student?.avatar ? (
              <img
                src={student.avatar}
                className="rounded-circle border border-2 border-light"
                alt={student.name || "avatar"}
                style={{ objectFit: "cover" }}
                onError={(e) => { e.target.src = DEFAULT_AVATAR_IMG; }}
              />
            ) : (
              <div
                className="avatar-img rounded-circle border border-secondary border-2 bg-light d-flex align-items-center justify-content-center fw-bold text-center"
                style={{ fontSize: "1.5rem", lineHeight: "1" }}
              >
                {(student?.name?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-body">
            <h5 className="modal-title text-white mb-0 fs-5 fw-bold">
              {student?.name ? `${student.name}'s Progress` : "Student Progress"}
            </h5>
            <span className="text-light opacity-75 small">{student?.email}</span>
          </div>
        </div>
        <button type="button" className="btn-close btn-close-white ms-auto me-1" onClick={onClose} aria-label="Close" />
      </ModalHeader>

      <ModalBody className="p-2 p-md-4">
        {loading ? (
          <div className="py-5 text-center">
            <Spinner animation="border" variant="primary" role="status" />
            <div className="mt-2">Loading comprehensive analytics...</div>
          </div>
        ) : error ? (
          <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>
        ) : sectionRows.length === 0 ? (
          <div className="py-5 text-center">No curriculum progress available for this student.</div>
        ) : (
          <>
            <h6 className="fw-bold mb-3 uppercase-tracking">Overall Performance</h6>
            <Row className="g-2 g-sm-3 mb-4">
              <Col xs={6} sm={3}>
                <Card className="border-0 shadow-sm h-100 p-2 p-sm-3 text-center">
                  <div className="text-primary mb-1"><FaBookOpen size={24} /></div>
                  <div className="fs-5 fw-bold mb-0">{stats.courseProgress}%</div>
                  <small className="style-micro">Course Complete</small>
                </Card>
              </Col>
              <Col xs={6} sm={3}>
                <Card className="border-0 shadow-sm h-100 p-2 p-sm-3 text-center">
                  <div className="text-success mb-1"><FaCheckCircle size={24} /></div>
                  <div className="fs-5 fw-bold mb-0">{stats.lectureCompleted}/{stats.totalLectures}</div>
                  <small className="style-micro">Lectures Finished</small>
                </Card>
              </Col>
              <Col xs={6} sm={3}>
                <Card className="border-0 shadow-sm h-100 p-2 p-sm-3 text-center">
                  <div className="text-info mb-1"><FaTasks size={24} /></div>
                  <div className="fs-5 fw-bold mb-0">{stats.quizzCleared}/{stats.totalQuizzes}</div>
                  <small className="style-micro">Quizzes Cleared</small>
                </Card>
              </Col>
              <Col xs={6} sm={3}>
                <Card className="border-0 shadow-sm h-100 p-2 p-sm-3 text-center">
                  <div className="text-warning mb-1"><FaAward size={24} /></div>
                  <div className="fs-5 fw-bold mb-0">{stats.quizAccuracy}%</div>
                  <small className="style-micro">Quiz Accuracy</small>
                </Card>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 uppercase-tracking">Syllabus Breakdown</h6>
            <style>{`
              .custom-quiz-accordion .accordion-item {
                border-bottom: 1px solid var(--bs-border-color) !important;
                background-color: transparent !important;
              }
              .custom-quiz-accordion .accordion-button:not(.collapsed) {
                background-color: rgba(var(--bs-heading-color-rgb), 0.04) !important; 
                color: var(--bs-heading-color) !important;
                border-bottom: 1px solid var(--bs-border-color) !important;
              }
              .custom-quiz-accordion .accordion-button:focus {
                border-color: rgba(var(--bs-heading-color-rgb), 0.3) !important;
                box-shadow: 0 0 0 0.25rem rgba(var(--bs-heading-color-rgb), 0.1) !important;
              }
              .custom-quiz-accordion .accordion-button::after {
                filter: brightness(0) saturate(100%) opacity(0.7) !important;
              }
              .custom-quiz-accordion .accordion-button:not(.collapsed)::after {
                filter: brightness(0) saturate(100%) opacity(1) !important;
              }
              [data-bs-theme="dark"] .custom-quiz-accordion .accordion-button::after {
                filter: brightness(0) invert(1) opacity(0.7) !important;
              }
              [data-bs-theme="dark"] .custom-quiz-accordion .accordion-button:not(.collapsed)::after {
                filter: brightness(0) invert(1) opacity(1) !important;
              }
            `}</style>
            <Accordion defaultActiveKey="0" className="rounded-3 overflow-hidden border custom-quiz-accordion">
              {sectionRows.map((section, index) => {
                const lectures = section?.lectures || [];
                const completedCount = lectures.filter(l => l.progress === 100).length;

                return (
                  <Accordion.Item eventKey={String(index)} key={section?.secId || section?.title} className="border-bottom">
                    <Accordion.Header>
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between w-100 pe-3 gap-1">
                        <div className="text-start">
                          <div className="fw-semibold fs-6 mb-0">{section?.title || "Untitled section"}</div>
                        </div>
                        <div className="bg-opacity-15 h6 fw-semibold small mb-0 px-2 py-1 bg-dark rounded-2 flex-shrink-0 mt-1 mt-sm-0">
                          {completedCount}/{lectures.length}
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="p-0">
                      {lectures.length > 0 ? (
                        <ListGroup variant="flush">
                          {lectures.map(renderLecture)}
                        </ListGroup>
                      ) : (
                        <div className="p-4 text-center small">
                          No lectures found inside this section.
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default StudentCourseProgressModal;