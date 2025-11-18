import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContainer,
  TabContent,
  TabPane,
} from "react-bootstrap";

import CourseMaterial from "./CourseMaterial";
// import Discussion from "./Discussion";
import useLearningCourseDetail from "../useLearningCourse"; // hook fetch API

const CourseDetail = () => {
  const { course, loading } = useLearningCourseDetail();

  if (loading) {
    return (
      <section className="pt-0">
        <Container>
          <Row>
            <Col xs={12} className="py-5 text-center">
              <div className="spinner-border text-primary" />
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="pt-0">
        <Container>
          <Row>
            <Col xs={12} className="py-5 text-center text-muted">
              Cannot load course detail.
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  return (
    <section className="pt-0">
      <Container >
        <Row>
          <Col xs={12}>
            <Card className="shadow rounded-2 p-0 mt-n5">
              <TabContainer defaultActiveKey="course">
                {/* --------- NAV TABS --------- */}
                <CardHeader className="border-bottom px-4 pt-3 pb-0">
                  <Nav
                    className="nav-bottom-line py-0"
                    id="course-pills-tab"
                    role="tablist"
                  >
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="course"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Course Materials
                      </NavLink>
                    </NavItem>

                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="discussion"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Discussion
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardHeader>

                {/* --------- TAB CONTENT --------- */}
                <CardBody className="p-sm-4">
                  <TabContent id="course-pills-tabContent">
                    {/* TAB: COURSE MATERIALS */}
                    <TabPane
                      eventKey="course"
                      className="fade"
                      role="tabpanel"
                    >
                      <CourseMaterial
                        title={course.title}
                        curriculum={course.curriculum}
                        previewVideo={course.previewVideo}
                        instructor={course.instructor}
                        description={course.description}
                      />
                    </TabPane>

                    {/* TAB: DISCUSSION */}
                    <TabPane
                      eventKey="discussion"
                      className="fade"
                      role="tabpanel"
                    >
                      {/* <Discussion courseId={course._id} /> */}
                    </TabPane>
                  </TabContent>
                </CardBody>
              </TabContainer>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CourseDetail;
