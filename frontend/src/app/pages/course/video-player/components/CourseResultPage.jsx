import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { FaCheckSquare, FaLightbulb, FaRobot, FaArrowLeft } from "react-icons/fa";
import { RiAlertFill } from 'react-icons/ri';

const CourseResultPage = () => {
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
        <Button onClick={() => navigate('/home')}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="text-center p-5">
        <h3 className="text-primary fw-bold mb-2">Course Completed!</h3>

        <div className="mb-4">
          <div className="display-5 fw-bold text-success">{assessment.overallScore}/100</div>
          <p className="text-uppercase fw-bold letter-spacing-2">Overall Score</p>
        </div>

        <div className="mb-3 border border-orange p-4 rounded-3 text-start">
          <h5 className="text-orange fw-bold d-flex align-items-center">
            <FaRobot className='mb-1 me-2' /> AI Mentor Feedback
          </h5>
          <span className='h6 fw-light'>{assessment.summary}</span>
        </div>

        <Row className="mt-2 text-start">
          <Col md={6}>
            <Card className="h-100 border-success border">
              <Card.Body>
                <h5 className="text-success fw-bold d-flex align-items-center">
                  <FaCheckSquare className='me-2' /> Strengths
                </h5>
                <ul className="mb-0 ps-3 h6 fw-light">
                  {assessment.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 border-danger border">
              <Card.Body>
                <h5 className="text-danger fw-bold d-flex align-items-center">
                  <RiAlertFill className='me-2' /> Areas to Improve
                </h5>
                <ul className="mb-0 ps-3 h6 fw-light">
                  {assessment.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="mt-4 border border-info p-4 rounded-3 text-start">
          <h5 className="text-info fw-bold d-flex align-items-center">
            <FaLightbulb className='mb-1 me-2' /> Recommendation
          </h5>
          <span className='h6 fw-light'>{assessment.recommendation}</span>
        </div>

        <div className="mt-5 d-flex justify-content-center gap-3">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" /> Back to Course
          </Button>

          <Button variant="outline-primary" onClick={() => navigate('/student/courses')}>
            My Learning
          </Button>
          
          <Button variant="primary" onClick={() => navigate('/home')}>
            Explore More Courses
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default CourseResultPage;