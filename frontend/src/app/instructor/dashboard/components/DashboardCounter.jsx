import { Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import { FaBook, FaStar, FaUserGraduate } from 'react-icons/fa';
import { RiBillFill } from 'react-icons/ri';


const CounterCard = ({ count, title, icon: Icon, suffix, variant, isDecimal }) => {
  return (
    <div className={`d-flex justify-content-center align-items-center p-4 bg-${variant} bg-opacity-15 rounded-3`}>
      {Icon && <Icon size={50} className={`fa-fw text-${variant}`} />}
      <div className="ms-4">
        <div className="d-flex">
          <h5 className="purecounter mt-1 mb-0 fw-bold">
            {isDecimal ? (
              <CountUp 
                suffix={suffix} 
                end={count} 
                decimals={1}
                decimal="." 
                delay={2} />
            ) : (
              <CountUp 
                suffix={suffix} 
                end={count} 
                delay={2} />
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
    title: 'Total Courses',
    icon: FaBook,
    //suffix: 'k',
    variant: 'orange',
    isDecimal: false
  }, {
    count: counterData?.totalStudents || 0,
    title: 'Total Students',
    icon: FaUserGraduate,
    //suffix: 'k',
    variant: 'success',
    isDecimal: false
  }, {
    count: counterData?.totalOrders || 0,
    title: 'Total Orders',
    icon: RiBillFill,
    //suffix: 'k',
    variant: 'info',
    isDecimal: false
  }, {
    count: counterData?.averageRating || 0.0,
    title: 'Average Rating',
    icon: FaStar,
    variant: 'warning',
    isDecimal: true
  }];

  return (
    <Row className="g-4">
      {counters.map((item, idx) => <Col sm={6} lg={3} key={idx}>
        <CounterCard {...item} />
      </Col>)}
    </Row>
  );
};

export default DashboardCounter;
