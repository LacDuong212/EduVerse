import PageMetaData from "@/components/PageMetaData";
import InstructorInfo from "./components/InstructorInfo";
import CoursesList from "./components/CoursesList";
import { Col, Container, Row } from "react-bootstrap";
import InstructorCounters from "./components/InstructorCounters";
import InstructorAvatarCard from "./components/InstructorAvatarCard";
import EducationListCard from "./components/EducationListCard";

const InstructorDetailsPage = () => {

  return (
    <>
      <PageMetaData title="Instructor Details" />
        <Container className="pt-4 pb-5">
          <Row className="g-0 g-lg-5">
            <Col lg={4}>
              <Row>
                <Col md={6} lg={12}>
                  <InstructorAvatarCard />
                </Col>
                <Col md={6} lg={12}>
                  <EducationListCard />
                </Col>
              </Row>
            </Col>
            <Col lg={8}>
              <Row>
                <InstructorInfo />
              </Row>
              <Row className="mt-4">
                <InstructorCounters />
              </Row>
              <Row className="mt-5">
                <h2 className="mt-0 mb-2">My Courses</h2>
                <CoursesList />
              </Row>
            </Col>
          </Row>
        </Container>
    </>
  );
};

export default InstructorDetailsPage;