import { Card, Col, Container, Row } from "react-bootstrap";
import { FaSlidersH } from "react-icons/fa";
import { useSelector } from "react-redux";
import patternImg from "@/assets/images/pattern/04.png";
import { DEFAULT_AVATAR_IMG } from "@/contexts/constants";
import StreakBadge from "./StreakBadge";
import { useStudentStats, useLearningStreak } from "./useStudentLayout";

const Banner = ({ toggleOffCanvas }) => {
  const { streak, loading: streakLoading } = useLearningStreak();
  const { userData } = useSelector((state) => state.auth);
  const { studentStats } = useStudentStats();

  return (
    <section className="pt-0 pb-2 pb-lg-5">
      <Container fluid className="px-0">
        <div className="bg-blue h-100px h-md-200px rounded-0"
          style={{
            background: `url(${patternImg}) no-repeat center center`,
            backgroundSize: "cover"
          }}></div>
      </Container>

      <Container className="mt-n4">
        <Row>
          <Col xs={12}>
            <Card className="bg-transparent card-body p-0">
              <Row className="d-flex justify-content-between">
                <Col xs={"auto"} className="mt-4 mt-md-0">
                  <div className="avatar avatar-xxl mt-n3">
                    {userData?.avatar ? (
                      <img
                        className="avatar-img rounded-circle border border-light border-3 shadow"
                        src={userData.avatar}
                        alt="Student Avatar"
                        onError={(e) => e.target.src = DEFAULT_AVATAR_IMG}
                      />
                    ) : (
                      <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                        {(userData?.name?.[0] || "S").toUpperCase()}
                      </div>
                    )}
                  </div>
                </Col>
                <Col className="d-md-flex justify-content-between align-items-center mt-4">
                  <div>
                    <h1 className="my-1 fs-4">
                      {userData?.name ?? "Student"}
                    </h1>
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{studentStats.totalCourses}</span>
                        &nbsp;
                        <span className="text-body fw-light">Total Courses</span>
                      </li>
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{studentStats.completedCourses}</span>
                        &nbsp;
                        <span className="text-body fw-light">Completed Courses</span>
                      </li>
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{studentStats.totalLectures}</span>
                        &nbsp;
                        <span className="text-body fw-light">Total Lectures</span>
                      </li>
                      <li className="list-inline-item me-3 mb-1 mb-sm-0">
                        <span className="h6">{studentStats.completedLectures}</span>
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