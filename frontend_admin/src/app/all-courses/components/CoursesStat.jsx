import { Col, Row } from 'react-bootstrap';


const CourseStatCard = ({ count, title, variant }) => {
  return (
    <Col>
      <div
        className={`text-center p-4 bg-${variant} bg-opacity-10 border border-${variant} rounded-3`}
      >
        <h6>{title}</h6>
        <h2 className={`mb-0 fs-1 text-${variant}`}>{count}</h2>
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
      title: "Active Courses",
      count: meta.activatedCourses || 0,
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
      variant: "danger",
    },
     {
      title: "Blocked Courses",
      count: meta.blockedCourses || 0,
      variant: "purple",
    },
  ];

  return (
    <>
      <Row className="mb-3">
        <Col xs={12} className="d-sm-flex justify-content-between align-items-center">
          <h1 className="h3 mb-2 mb-sm-0">Courses</h1>
        </Col>
      </Row>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Row className="g-4 mb-4" xs={1} sm={2} md={3} xl={5}>
          {courseStatData.map((item, idx) => (
            <CourseStatCard key={idx} {...item} />
          ))}
        </Row>
      )}
    </>
  );
};

export default CoursesStat;
