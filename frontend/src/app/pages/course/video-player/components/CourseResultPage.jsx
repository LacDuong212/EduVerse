import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import {
  FaArrowLeft,
  FaCheckSquare,
  FaLightbulb,
  FaRobot,
} from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";

export default function CourseResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  const assessment = state?.assessment;

  if (!assessment) {
    return (
      <Container className="py-2 text-center">
        <Alert variant="warning">
          No result found. Please finish the course first.
        </Alert>

        <Button onClick={() => navigate("/home")}>Back to Home</Button>
      </Container>
    );
  }

  const [searchParams] = useSearchParams();

  const [activeKey, setActiveKey] = useState(
    searchParams.get("tab") || "overview"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveKey(tab);
  }, [searchParams]);

  return (
    <Container className="py-4">
      <Card className="text-center p-5">
        <h3 className="text-primary fw-bold mb-2">Course Completed!</h3>

        <div className="mb-4">
          <div className="display-5 fw-bold text-success">
            {assessment.overallScore ?? 0}/100
          </div>
          <p className="text-uppercase fw-bold letter-spacing-2">
            Overall Score
          </p>
        </div>

        <div className="mb-3 border border-orange p-4 rounded-3 text-start">
          <h5 className="text-orange fw-bold d-flex align-items-center">
            <FaRobot className="mb-1 me-2" /> AI Mentor Feedback
          </h5>
          <span className="h6 fw-light">
            {assessment.summary || "No summary available."}
          </span>
        </div>

        <Row className="mt-2 text-start">
          <Col md={6}>
            <Card className="h-100 border-success border">
              <Card.Body>
                <h5 className="text-success fw-bold d-flex align-items-center">
                  <FaCheckSquare className="me-2" /> Strengths
                </h5>

                <ul className="mb-0 ps-3 h6 fw-light">
                  {(assessment.strengths || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 border-danger border">
              <Card.Body>
                <h5 className="text-danger fw-bold d-flex align-items-center">
                  <RiAlertFill className="me-2" /> Areas to Improve
                </h5>

                <ul className="mb-0 ps-3 h6 fw-light">
                  {(assessment.weaknesses || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="mt-4 border border-info p-4 rounded-3 text-start">
          <h5 className="text-info fw-bold d-flex align-items-center">
            <FaLightbulb className="mb-1 me-2" /> Recommendation
          </h5>

          <span className="h6 fw-light">
            {assessment.recommendation || "No recommendation available."}
          </span>
        </div>

        <div className="mt-5 d-flex justify-content-center gap-3 flex-wrap">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" /> Back to Course
          </Button>

          <Button
            variant="outline-primary"
            onClick={() => navigate("/student/courses")}
          >
            My Learning
          </Button>

          <Button
            variant="outline-orange"
            onClick={() => navigate(`/courses/${courseId}?tab=reviews`)}
          >
            Review Course
          </Button>

          <Button variant="outline-purple" onClick={() => navigate("/courses")}>
            Explore More Courses
          </Button>
        </div>
      </Card>
    </Container>
  );
}