import { adminCounterData } from '@/assets/data/products';
import { Card, Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
const CounterCard = ({
  count,
  title,
  icon: Icon,
  suffix,
  variant
}) => {
  return <Card className={`card-body bg-${variant} bg-opacity-15 p-4 h-100`}>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="purecounter mb-0 fw-bold" data-purecounter-start={0} data-purecounter-end={1958} data-purecounter-delay={200}>
            <CountUp end={count} suffix={suffix} delay={1} />
          </h2>
          <span className="mb-0 h6 fw-light">{title}</span>
        </div>
        <div className={`icon-lg rounded-circle bg-${variant} text-white mb-0`}>{Icon && <Icon />}</div>
      </div>
    </Card>;
};
const Counter = () => {
  return <Row className="g-4 mb-4">
      {adminCounterData.map((item, idx) => <Col md={6} xxl={3} key={idx}>
          <CounterCard {...item} />
        </Col>)}
    </Row>;
};
export default Counter;
