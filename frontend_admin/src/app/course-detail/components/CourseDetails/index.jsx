import { useEffect, useState } from "react";
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
import { useSearchParams } from "react-router-dom";

import CurriculumTab from "./components/CurriculumTab";
import InstructorTab from "./components/InstructorTab";
import OverviewTab from "./components/OverviewTab";
import CoursePreviewCard from "./components/CoursePreviewCard";
import Reviews from "./components/Reviews";
import TagsCard from "./components/TagsCard";
import CourseIncludeCard from "./components/CourseIncludeCard";

const CourseDetails = ({ course }) => {
  const [searchParams] = useSearchParams();

  const [activeKey, setActiveKey] = useState(
    searchParams.get("tab") || "overview"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveKey(tab);
    }
  }, [searchParams]);

  const handleSelectTab = (key) => {
    if (!key) return;
    setActiveKey(key);
  };

  return (
    <section className="pb-0 py-lg-5">
      <Container>
        <Row>
          <Col lg={8}>
            <Card className="shadow rounded-2 p-0">
              <TabContainer activeKey={activeKey} onSelect={handleSelectTab}>
                <CardHeader className="border-bottom px-4 py-3">
                  <Nav
                    className="nav-pills nav-tabs-line py-0"
                    id="course-pills-tab"
                    role="tablist"
                  >
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="overview"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Overview
                      </NavLink>
                    </NavItem>

                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="curriculum"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Curriculum
                      </NavLink>
                    </NavItem>

                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="instructor"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Instructor
                      </NavLink>
                    </NavItem>

                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="reviews"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Reviews
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardHeader>

                <CardBody className="p-4">
                  <TabContent id="course-pills-tabContent">
                    <TabPane
                      eventKey="overview"
                      className="fade"
                      role="tabpanel"
                    >
                      <OverviewTab description={course?.description} />
                    </TabPane>

                    <TabPane
                      eventKey="curriculum"
                      className="fade"
                      role="tabpanel"
                    >
                      <CurriculumTab curriculum={course?.curriculum || []} />
                    </TabPane>

                    <TabPane
                      eventKey="instructor"
                      className="fade"
                      role="tabpanel"
                    >
                      <InstructorTab instructor={course?.instructor} />
                    </TabPane>

                    <TabPane
                      eventKey="reviews"
                      className="fade"
                      role="tabpanel"
                    >
                      <Reviews rating={course?.rating} />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </TabContainer>
            </Card>
          </Col>

          <Col lg={4} className="pt-5 pt-lg-0">
            <Row className="g-4 mb-5 mb-lg-0">
              <Col md={6} lg={12}>
                <CoursePreviewCard course={course} />
                <CourseIncludeCard course={course} />
              </Col>

              <Col md={6} lg={12}>
                <TagsCard tags={course?.tags || []} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CourseDetails;