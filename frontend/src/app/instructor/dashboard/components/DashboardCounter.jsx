import { Col, Row } from "react-bootstrap";
import CountUp from "react-countup";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { FaBook, FaStar, FaUserGraduate } from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";

const CounterCard = ({ count, title, icon: Icon, suffix, variant, isDecimal }) => {
  return (
    <div className={`d-flex justify-content-center align-items-center p-4 bg-${variant} bg-opacity-15 rounded-3`}>
      {Icon && <Icon size={35} className={`fa-fw text-${variant} flex-shrink-0`} />}
      <div className="ms-2">
        <div className="d-flex">
          <h5 className="purecounter mt-1 mb-0 fw-bold">
            {isDecimal ? (
              <CountUp 
                suffix={suffix} 
                end={count} 
                decimals={1}
                decimal="." 
                delay={1} />
            ) : (
              <CountUp 
                suffix={suffix} 
                end={count} 
                delay={1} />
            )}
          </h5>
        </div>
        <span className="mb-0 h6 fw-light">{title}</span>
      </div>
    </div>
  );
};

const DashboardCounter = ({ counterData = {} }) => {
  const counters = [{
    count: counterData?.totalCourses || 0,
    title: "Courses",
    icon: FaBook,
    //suffix: 'k',
    variant: "orange",
    isDecimal: false
  }, {
    count: counterData?.totalStudents || 0,
    title: "Students",
    icon: FaUserGraduate,
    //suffix: 'k',
    variant: "success",
    isDecimal: false
  }, {
    count: counterData?.totalOrders || 0,
    title: "Orders",
    icon: RiBillFill,
    //suffix: 'k',
    variant: "info",
    isDecimal: false
  }, {
    count: counterData?.totalReviews || 0,
    title: "Reviews",
    icon: BsFillChatLeftTextFill,
    //suffix: 'k',
    variant: "purple",
    isDecimal: false
  }, {
    count: counterData?.averageRating || 0.0,
    title: "Rating",
    icon: FaStar,
    variant: "warning",
    isDecimal: true
  }];

  return (
    <Row className="d-flex g-4 justify-content-center">
      {counters.map((item, idx) => <Col sm={4} md={4} lg={2} key={idx}>
        <CounterCard {...item} />
      </Col>)}
    </Row>
  );
};

export default DashboardCounter;