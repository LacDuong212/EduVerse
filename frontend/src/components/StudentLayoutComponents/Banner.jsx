import patternImg from '@/assets/images/pattern/04.png';

import { Card, Col, Container, Row } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useLearningStreak from "@/hooks/useLearningStreak";
import StreakBadge from "./StreakBadge";
import { useMyCourses } from "./useMyCourses"; // 👈 thêm

const Banner = ({ toggleOffCanvas, studentData }) => {
  const { streak, loading: streakLoading } = useLearningStreak();
  const { stats: courseStats } = useMyCourses(); // 👈 lấy stats

  const completedCourses = courseStats?.completed ?? (studentData.completedCourses ?? 0);
  const completedLectures =
    courseStats?.totalCompletedLectures ?? (studentData.completedLectures ?? 0);

  return (
    <section className="pt-0 pb-2 pb-lg-5">
      {/* Banner Background */}
      <Container fluid className="px-0">
        <div className="bg-blue h-100px h-md-200px rounded-0"
          style={{
            background: `url(${patternImg}) no-repeat center center`,
            backgroundSize: 'cover'
          }}></div>
      </Container>

      {/* Banner Content */}
      <Container className="mt-n4">
        <Row>
          <Col xs={12}>
            <Card className="bg-transparent card-body p-0">
              <Row className="d-flex justify-content-between">
                <Col xs={'auto'} className="mt-4 mt-md-0">
                  <div className="avatar avatar-xxl mt-n3">
                    {studentData?.pfpImg ? (
                      <img
                        className="avatar-img rounded-circle border border-light border-3 shadow"
                        src={studentData.pfpImg}
                        alt="Student Avatar" />
                    ) : (
                      <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                        {(studentData?.name?.[0] || "S").toUpperCase()}
                      </div>
                    )}
                  </div>
                </Col>
                <Col className="d-md-flex justify-content-between align-items-center mt-4">
                  <div>
                   <h1 className="my-1 fs-4">{studentData.name ?? 'Student'}</h1>
                    <ul className="list-inline mb-0">
                      {/* <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{studentData.point ?? 0}</span>
                        &nbsp;<span className="text-body fw-light">Points</span>
                      </li> */}
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{completedCourses}</span>
                        &nbsp;
                        <span className="text-body fw-light">Completed Courses</span>
                      </li>
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{completedLectures}</span>
                        &nbsp;
                        <span className="text-body fw-light">Completed Lectures</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 mt-sm-4">
                    <StreakBadge streak={streak} loading={streakLoading} />
                  </div>

                </Col>
              </Row>
            </Card>
            <hr className="d-xl-none" />
            <Col xs={12} xl={3} className="d-flex justify-content-between align-items-center">
              <a className="h6 mb-0 fw-bold d-xl-none" href="#">
                Menu
              </a>
              <button onClick={toggleOffCanvas} className="btn btn-primary d-xl-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar">
                <FaSlidersH />
              </button>
            </Col>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;
