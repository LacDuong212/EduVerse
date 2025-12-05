import { Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import { counterData } from '../data';

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
              <CountUp suffix={suffix} end={count} delay={2} />
            </h5>
          </div>
          <p className="mb-0 h6 fw-light">{title}</p>
        </div>
      </div>
    </Col>
  );
};

const InstructorCounters = () => {
  return (
    <>
      {counterData.map((item, idx) => <CounterCard key={idx} {...item} />)}
    </>
  );
};

export default InstructorCounters;