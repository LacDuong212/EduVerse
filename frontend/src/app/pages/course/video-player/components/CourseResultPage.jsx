import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import {
  FaArrowLeft,
  FaCheckSquare,
  FaCertificate,
  FaLightbulb,
  FaRobot,
  FaStar,
} from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";
import axios from "axios";
import { toast } from "react-toastify";
import RatingModal from "./RatingModal";
import ListedCourses from "@/app/student/dashboard/components/ListedCourses";
import { setRecommendedCourses } from "@/redux/coursesSlice";

export default function CourseResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  const assessment = state?.assessment;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchParams] = useSearchParams();
  const [showRating,   setShowRating]   = useState(false);
  const [hasReviewed,  setHasReviewed]  = useState(null);

  const dispatch = useDispatch();
  const recommendedCourses = useSelector(
    (state) => state.courses?.recommended || []
  );

  useEffect(() => {
    if (recommendedCourses.length > 0) return;
    axios
      .get(`${backendUrl}/api/courses/recommendations`, { withCredentials: true })
      .then((res) => {
        if (res?.data?.success) {
          dispatch(setRecommendedCourses(res.data?.result?.courses || []));
        }
      })
      .catch(() => {
        // non-blocking — recommendations are optional
      });
  }, [backendUrl, dispatch, recommendedCourses.length]);

  useEffect(() => {
    if (!courseId) return;
    axios
      .get(`${backendUrl}/api/reviews/check/${courseId}`, { withCredentials: true })
      .then((res) => {
        const reviewed = res.data?.result?.hasReviewed ?? false;
        setHasReviewed(reviewed);
        if (!reviewed) setShowRating(true);
      })
      .catch(() => setHasReviewed(null));
  }, [courseId]);

  const [activeKey, setActiveKey] = useState(
    searchParams.get("tab") || "overview"
  );

  const [issuingCert, setIssuingCert] = useState(false);

  const handleGetCertificate = async () => {
    setIssuingCert(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/certificates/courses/${courseId}/issue`,
        {},
        { withCredentials: true }
      );
      const certId = res.data?.result?.certId;
      if (certId) {
        navigate(`/certificates/${certId}`);
      } else {
        toast.error("Could not generate certificate.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not generate certificate.");
    } finally {
      setIssuingCert(false);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveKey(tab);
  }, [searchParams]);

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
            variant="success"
            onClick={handleGetCertificate}
            disabled={issuingCert}
            className="d-flex align-items-center"
          >
            <FaCertificate className="me-2" />
            {issuingCert ? "Generating..." : "Get Certificate"}
          </Button>

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

          {hasReviewed && (
            <span className="d-flex align-items-center gap-2 text-body small px-3 py-2" style={{ opacity: 0.55 }}>
              <FaStar size={13} color="#F59E0B" /> You've rated this course
            </span>
          )}

          <Button variant="outline-purple" onClick={() => navigate("/courses")}>
            Explore More Courses
          </Button>
        </div>
      </Card>

      <ListedCourses />

      <RatingModal
        show={showRating}
        onHide={() => { setShowRating(false); setHasReviewed(true); }}
        courseId={courseId}
      />
    </Container>
  );
}