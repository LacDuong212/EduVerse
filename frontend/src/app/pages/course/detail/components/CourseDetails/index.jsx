import { useState } from "react";
import {
  Card, CardBody, CardHeader,
  Col,
  Container,
  Nav, NavItem, NavLink,
  Row,
  TabContainer, TabContent, TabPane
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CurriculumTab from "./components/CurriculumTab";
import InstructorTab from "./components/InstructorTab";
import OverviewTab from "./components/OverviewTab";
import PricingCard from "./components/PricingCard";
import Reviews from "./components/Reviews";
import TagsCard from "./components/TagsCard";
import CourseIncludeCard from "./components/CourseIncludeCard";

const CourseDetails = ({ course, owned, onAddToCart }) => {
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeKey, setActiveKey] = useState("overview");

  const isEnrolled = owned && userData?.role === "student";
  const courseId = course?.courseId || id;
  const finalPrice = course?.enableDiscount ? course?.discountPrice : course?.price;

  const handleSelectTab = (k) => {
    if (!k) return;
    if (k === "curriculum" && isEnrolled) navigate(`/student/courses/${courseId || ""}`)
    setActiveKey(k);
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
                    <TabPane eventKey="overview" className="fade" role="tabpanel">
                      <OverviewTab description={course?.description} />
                    </TabPane>
                    <TabPane eventKey="curriculum" className="fade" role="tabpanel">
                      <CurriculumTab
                        curriculum={course?.curriculum || []}
                        price={finalPrice || null}
                        action={onAddToCart}
                      />
                    </TabPane>
                    <TabPane eventKey="instructor" className="fade" role="tabpanel">
                      <InstructorTab instructor={course?.instructor} />
                    </TabPane>
                    <TabPane eventKey="reviews" className="fade" role="tabpanel">
                      <Reviews rating={course?.rating} isEnrolled={isEnrolled} />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </TabContainer>
            </Card>
          </Col>
          <Col lg={4} className="pt-5 pt-lg-0">
            <Row className="g-4 mb-5 mb-lg-0">
              <Col md={6} lg={12}>
                <PricingCard
                  course={course}
                  owned={isEnrolled}
                  courseId={courseId}
                  onAddToCart={onAddToCart}
                  setActiveKey={setActiveKey}
                />
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