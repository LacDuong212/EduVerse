import { Col, Container, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import { counterData } from '../data';
const Counter = () => {
  return <section className="py-0 py-xl-5">
      <Container>
        <Row className="g-4">
          {counterData.map((item, idx) => {
          const Icon = item.icon;
          return <Col sm={6} xl={3} key={idx}>
                <div className={`d-flex justify-content-center align-items-center p-4 bg-${item.variant} bg-opacity-10 rounded-3`}>
                  <span className={`display-6 lh-1 text-${item.variant} mb-0`}>
                    <Icon />
                  </span>
                  <div className="ms-4 h6 fw-normal mb-0">
                    <div className="d-flex">
                      <h5 className="purecounter mb-0 fw-bold">
                        <CountUp delay={2} end={item.count} suffix={item.suffix} />
                      </h5>
                    </div>
                    <p className="mb-0">{item.title}</p>
                  </div>
                </div>
              </Col>;
        })}
        </Row>
      </Container>
    </section>;
};
export default Counter;
