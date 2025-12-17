import { Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import { FaBook, FaStar, FaUserGraduate } from 'react-icons/fa';

const CounterCard = ({
  count,
  title,
  icon: Icon,
  suffix,
  variant
}) => {
  return (
    <Col sm={4}>
      <div className="d-flex align-items-center">
        <span className={`icon-lg text-${variant} mb-0 bg-${variant} bg-opacity-10 rounded-3`}>{Icon && <Icon size={22} />}</span>
        <div className="ms-3">
          <div className="d-flex">
            <h5 className="purecounter mb-0 fw-bold" data-purecounter-start={0} data-purecounter-end={10} data-purecounter-delay={200}>
              <CountUp suffix={suffix} end={count} delay={0.5} />
            </h5>
          </div>
          <p className="mb-0 h6 fw-light">{title}</p>
        </div>
      </div>
    </Col>
  );
};

const InstructorCounters = ({ 
  totalPublicCourses = 0, 
  totalStudents = 0,
  totalReviews = 0 
}) => {
  const formatSuffix = (value, defaultSuffix) => {
    if (!Number.isFinite(value)) return defaultSuffix || '';
    if (value >= 1000) return 'K+';
    return defaultSuffix || '';
  }

  const counterData = [{
    count: Math.max(0, Number(totalPublicCourses || 0)),
    title: 'Total Courses',
    icon: FaBook,
    suffix: formatSuffix(totalPublicCourses, ''),
    variant: 'orange'
  }, {
    count: Math.max(0, Number(totalStudents || 0)),
    title: 'Total Students',
    icon: FaUserGraduate,
    suffix: formatSuffix(totalStudents, ''),
    variant: 'success'
  }, {
    count: Math.max(0, Number(totalReviews || 0)),
    title: 'Total Reviews',
    icon: FaStar,
    suffix: formatSuffix(totalReviews, ''),
    variant: 'warning'
  }];

  return (
    <>
      {counterData.map((item, idx) => <CounterCard key={idx} {...item} />)}
    </>
  );
};

export default InstructorCounters;