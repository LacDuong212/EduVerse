import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import PageMetaData from "@/components/PageMetaData";
import CoursesList from "./components/CoursesList";
import EducationAndSkillsCard from "./components/EducationAndSkillsCard";
import InstructorAvatarCard from "./components/InstructorAvatarCard";
import InstructorCounters from "./components/InstructorCounters";
import InstructorInfo from "./components/InstructorInfo";
import useInstructorPublicDetails from "./useInstructorPublicDetails";
import NotFoundPage from "@/components/not-found";

const InstructorDetailsPage = () => {
  const { id: insId } = useParams();

  const { instructor, stats, loading, error, refresh } = useInstructorPublicDetails(insId);

  const hasNoData = !instructor || Object.keys(instructor).length === 0;

  if (loading) {
    return (
      <>
        <PageMetaData title="Instructor Details" />
        <div className="position-absolute top-50 start-50 translate-middle">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "30px", height: "30px" }}
          />
        </div>
      </>
    );
  }

  if (error) return (
    <>
      <PageMetaData title="InstructorDetails" />
      <NotFoundPage />
    </>
  );

  return (
    <>
      <PageMetaData title="Instructor Details" />
      <Container className="py-5">
        <Row className="g-5">
          <Col lg={4}>
            <Row className="g-4">
              <Col md={6} lg={12}>
                <InstructorAvatarCard data={{ ...instructor, ...stats }} />
              </Col>
              <Col md={6} lg={12}>
                <EducationAndSkillsCard
                  educationList={instructor?.education || []}
                  skillsList={instructor?.skills || []}
                />
              </Col>
            </Row>
          </Col>
          <Col lg={8}>
            <Row>
              {hasNoData ? (
                <div className="p-3">No instructor information available.</div>
              ) : (
                <InstructorInfo data={instructor} />
              )}
            </Row>
            <Row className="mt-0 g-3">
              {!hasNoData && <InstructorCounters stats={stats} />}
            </Row>
            <Row className="mt-5">
              {!hasNoData && <CoursesList insId={instructor?.insId || insId} />}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default InstructorDetailsPage;