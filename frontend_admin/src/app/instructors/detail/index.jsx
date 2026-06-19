import { Col, Container, Row, Spinner } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import PageMetaData from "@/components/PageMetaData";
import CoursesList from "./components/CoursesList";
import EducationAndSkillsCard from "./components/EducationAndSkillsCard";
import InstructorAvatarCard from "./components/InstructorAvatarCard";
import InstructorCounters from "./components/InstructorCounters";
import InstructorInfo from "./components/InstructorInfo";
import useAdminInstructorDetail from "./useAdminInstructorDetail";

const AdminInstructorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instructor, stats, loading, error } = useAdminInstructorDetail(id);

  if (loading) {
    return (
      <>
        <PageMetaData title="Instructor Detail" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  if (error || !instructor) {
    return (
      <>
        <PageMetaData title="Instructor Detail" />
        <div className="text-center py-5">
          <p className="text-danger mb-3">{error || "Instructor not found."}</p>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMetaData title={`${instructor.name || "Instructor"} - Detail`} />

      <div className="border-bottom pt-1 pb-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center fw-semibold text-primary flex-shrink-0"
            onClick={() => navigate(-1)}
          >
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle border me-2"
              style={{ width: 32, height: 32 }}
            >
              <FaArrowLeft size={13} />
            </span>
            Back
          </button>

          <div className="vr d-none d-sm-block" />

          <div className="min-w-0">
            <h1 className="h3 mb-0 text-truncate">{instructor.name}</h1>
            <p className="page-subtitle mb-0 text-truncate">{instructor.email}</p>
          </div>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Row className="g-4">
            <Col md={6} lg={12}>
              <InstructorAvatarCard data={{ ...instructor, ...stats }} />
            </Col>
            <Col md={6} lg={12}>
              <EducationAndSkillsCard
                educationList={instructor.education || []}
                skillsList={instructor.skills || []}
              />
            </Col>
          </Row>
        </Col>

        <Col lg={8}>
          <Row>
            <InstructorInfo data={instructor} />
          </Row>
          <Row className="mt-3 g-3">
            <InstructorCounters stats={stats} />
          </Row>
          <CoursesList instructorId={id} />
        </Col>
      </Row>
    </>
  );
};

export default AdminInstructorDetailPage;
