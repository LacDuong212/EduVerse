import { Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';


const CourseStatCard = ({ count, title, variant }) => {
  return (
    <Col className="d-flex">
      <div
        className={`w-100 text-center p-4 bg-${variant} bg-opacity-10 border border-${variant} rounded-3 stat-card-hover d-flex flex-column align-items-center justify-content-center`}
      >
        <h6 className="mb-2">{title}</h6>
        <h2 className={`mb-0 fs-1 text-${variant}`}>
          <CountUp end={count} duration={1.5} delay={0.2} />
        </h2>
      </div>
    </Col>
  );
};

const CoursesStat = ({ meta, loading }) => {

  const courseStatData = [
    {
      title: "Total Courses",
      count: meta.totalCoursesReal || 0,
      variant: "primary",
    },
    {
      title: "Live Courses",
      count: meta.liveCourses || 0,
      variant: "success",
    },
    {
      title: "Pending Courses",
      count: meta.pendingCourses || 0,
      variant: "warning",
    },
    {
      title: "Rejected Courses",
      count: meta.rejectedCourses || 0,
      variant: "orange",
    },
    {
      title: "Blocked Courses",
      count: meta.blockedCourses || 0,
      variant: "purple",
    },
    {
      title: "Deleted Courses",
      count: meta.deletedCourses || 0,
      variant: "danger",
    },
  ];

  return (
    <>
      {loading ? (
        <Row className="g-3 mb-4" xs={2} sm={3} xl={6}>
          {courseStatData.map((_, idx) => (
            <Col key={idx}>
              <div className="p-4 rounded-3 bg-light" style={{ height: '100px' }} />
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="g-3 mb-4" xs={2} sm={3} xl={6}>
          {courseStatData.map((item, idx) => (
            <CourseStatCard key={idx} {...item} />
          ))}
        </Row>
      )}
    </>
  );
};

export default CoursesStat;
