// app/pages/course-learning/CourseDetail.jsx (đường dẫn tuỳ bạn)

import React, { useMemo } from "react";
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
import { useParams } from "react-router-dom";

import CourseMaterial from "./CourseMaterial";
// import Discussion from "./Discussion";
import useLearningCourseDetail from "../useLearningCourse";   // hook fetch course
import useCourseProgress from "@/hooks/useCourseProgress";         // hook progress

const CourseDetail = () => {
  const { courseId } = useParams(); // /student/courses/:courseId

  const { course, loading } = useLearningCourseDetail();

  console.log("[CourseDetail] render");
  console.log("[CourseDetail] courseId from URL:", courseId);
  console.log("[CourseDetail] loading:", loading);
  console.log("[CourseDetail] course:", course);

  // Lấy progress theo courseId từ URL (không phụ thuộc course._id)
  const {
    progress,
    loading: progressLoading,
    error: progressError,
  } = useCourseProgress(courseId);

  console.log("[CourseDetail] progressLoading:", progressLoading);
  console.log("[CourseDetail] progress:", progress);

  // Map progress.lectures -> lectureTracking cho CourseMaterial
  // progress từ hook = data.progress (theo code useCourseProgress của bạn)
  const lectureTracking = useMemo(() => {
    const map = {};

    if (!progress?.lectures) {
      console.log("[CourseDetail] no progress.lectures, return empty map");
      return map;
    }

    for (const lp of progress.lectures) {
      const lectureId = lp.lectureId;
      if (!lectureId) continue;

      const statusFromBackend = lp.status || "not-started";
      const lastPositionSec = lp.lastPositionSec ?? 0;
      const durationSec = lp.durationSec ?? 0;

      let status = statusFromBackend;
      if (!statusFromBackend) {
        if (durationSec > 0 && lastPositionSec >= durationSec) {
          status = "completed";
        } else if (lastPositionSec > 0) {
          status = "in-progress";
        } else {
          status = "not-started";
        }
      }

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

    console.log("[CourseDetail] lectureTracking map:", map);
    return map;
  }, [progress]);

  if (loading) {
    console.log("[CourseDetail] loading = true -> show spinner");
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

  // ❌ Chỉ khi API course fail thực sự thì mới show lỗi này
  if (!course) {
    console.log("[CourseDetail] course is null -> show error UI");
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

  console.log("[CourseDetail] course is available, render UI");

  return (
    <section className="pt-0">
      <Container>
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

                    {/* <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="discussion"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Discussion
                      </NavLink>
                    </NavItem> */}
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
                        lectureTracking={lectureTracking} // ✅ tracking
                      />

                      {/* progressError chỉ cảnh báo, không chặn curriculum */}
                      {progressError && (
                        <p className="text-danger small mt-2">
                          Cannot load progress: {String(progressError)}
                        </p>
                      )}
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
