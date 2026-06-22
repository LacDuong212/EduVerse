import { useMemo } from "react";
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

import CourseMaterial from "./CourseMaterial";
import NotesTab from "./NotesTab";
import QnaTab from "./QnaTab";

const CourseDetail = ({ course, progress, progressError }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "course";

  const handleTabSelect = (key) => {
    setSearchParams(key === "course" ? {} : { tab: key }, { replace: true });
  };

  const lectureTracking = useMemo(() => {
    const map = {};

    if (!progress?.lectures) return map;

    for (const lp of progress.lectures) {
      const lectureId = lp.lecId;
      if (!lectureId) continue;

      const status = lp.status || "not_started";
      const lastPositionSec = lp.lastPositionSec ?? 0;
      const durationSec = lp.durationSec ?? 0;

      let percent = 0;

      if (status === "completed") {
        percent = 100;
      } else if (durationSec > 0 && lastPositionSec > 0) {
        percent = Math.min(
          100,
          Math.round((lastPositionSec / durationSec) * 100)
        );
      }

      map[lectureId] = {
        status,
        progress: percent,
      };
    }

    return map;
  }, [progress]);

  if (!course) return null;

  const sections = course.curriculum?.sections || [];

  return (
    <section className="pt-0">
      <Container>
        <Row>
          <Col xs={12}>
            <Card className="shadow rounded-2 p-0 mt-n5">
              <TabContainer
                activeKey={activeTab}
                onSelect={handleTabSelect}
              >
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
                        type="button"
                        role="tab"
                      >
                        Course Materials
                      </NavLink>
                    </NavItem>

                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="qa"
                        type="button"
                        role="tab"
                      >
                        Q&amp;A
                      </NavLink>
                    </NavItem>

                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="notes"
                        type="button"
                        role="tab"
                      >
                        Notes
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardHeader>

                <CardBody className="p-sm-4">
                  <TabContent id="course-pills-tabContent">
                    <TabPane
                      eventKey="course"
                      className="fade"
                      role="tabpanel"
                    >
                      <CourseMaterial
                        curriculum={sections}
                        lectureTracking={lectureTracking}
                      />

                      {progressError && (
                        <p className="text-danger small mt-2">
                          Cannot load progress: {String(progressError)}
                        </p>
                      )}
                    </TabPane>

                    <TabPane
                      eventKey="qa"
                      className="fade"
                      role="tabpanel"
                    >
                      {activeTab === "qa" && (
                        <QnaTab sections={sections} />
                      )}
                    </TabPane>

                    <TabPane
                      eventKey="notes"
                      className="fade"
                      role="tabpanel"
                    >
                      {activeTab === "notes" && (
                        <NotesTab
                          sections={sections}
                          courseTitle={course.title}
                        />
                      )}
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
