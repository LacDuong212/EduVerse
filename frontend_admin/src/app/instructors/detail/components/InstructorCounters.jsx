import { Col } from "react-bootstrap";
import CountUp from "react-countup";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { FaBook, FaUserGraduate } from "react-icons/fa";

const CounterCard = ({ count, title, icon: Icon, suffix, variant }) => (
  <Col sm={4}>
    <div className="d-flex align-items-center">
      <span className={`icon-lg text-${variant} mb-0 bg-${variant} bg-opacity-10 rounded-3`}>
        {Icon && <Icon size={22} />}
      </span>
      <div className="ms-3">
        <h5 className="mb-0 fw-bold">
          <CountUp suffix={suffix} end={count} delay={0.5} />
        </h5>
        <p className="mb-0 h6 fw-light">{title}</p>
      </div>
    </div>
  </Col>
);

const InstructorCounters = ({ stats }) => {
  const { totalCourses = 0, totalStudents = 0, totalReviews = 0 } = stats || {};

  const toThousand = (value) => (value >= 10000 ? value / 1000 : value);
  const formatSuffix = (value) => (Number.isFinite(value) && value >= 10000 ? "k+" : "");

  const counterData = [
    { count: toThousand(totalCourses), title: "Total Courses", icon: FaBook, suffix: formatSuffix(totalCourses), variant: "orange" },
    { count: toThousand(totalStudents), title: "Total Students", icon: FaUserGraduate, suffix: formatSuffix(totalStudents), variant: "success" },
    { count: Math.max(0, Number(totalReviews || 0)), title: "Total Reviews", icon: BsFillChatLeftTextFill, suffix: formatSuffix(totalReviews), variant: "purple" },
  ];

  return (
    <>
      {counterData.map((item, idx) => <CounterCard key={idx} {...item} />)}
    </>
  );
};

export default InstructorCounters;
