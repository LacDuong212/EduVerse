import { Col, Container, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import { counterData } from '../data';
const CounterCard = ({
  count,
  title,
  suffix
}) => {
  return <Col sm={6} lg={3} className="text-center">
      <div className="d-flex justify-content-center">
        <h4 className="purecounter display-6 text-orange fw-bold mb-0">
          <CountUp suffix={suffix} end={count} delay={2} />
        </h4>
      </div>
      <h6 className="mb-0 fw-bold">{title}</h6>
    </Col>;
};
const Counter = () => {
  return <section className="py-0 py-lg-5">
      <Container>
        <div className="bg-orange bg-opacity-10 p-4 p-sm-5 rounded position-relative overflow-hidden">
          <figure className="position-absolute top-50 end-0 translate-middle-y me-n7">
            <svg className="fill-white opacity-8 rotate-193" width="676px" height="161.3px" viewBox="0 0 676 161.3" xmlSpace="preserve">
              <path d="M53.6,18.8c28.6,8.8,50.3,27.3,70.9,48c19.9,19.9,39.5,40.8,65.3,53c53.3,24.9,116,12.4,168.2-9.1 c58.4-23.9,113.2-59.8,176.2-70.3c30.9-5.1,64.1-2.6,90.9,14.7c22.4,14.4,34.4,36.9,39.5,62.4c2.9,14.5,3.9,29.2,4.6,43.9h6.8 c-0.2-4.2-0.5-8.3-0.8-12.5c-1.7-24.1-4.9-49.1-17.6-70.3c-14.5-23.9-40-39.2-67-44.8c-32.9-6.8-67.2-0.3-98.5,10.2 c-30.3,10-59,24.2-87.7,38.1c-54.8,26.4-115.5,53.1-177.9,42c-14.5-2.6-28.7-7.4-41.7-14.7c-12.8-7.3-23.9-16.7-34.6-26.7 c-20.7-19.6-39.4-42-64.1-56.8c-25.6-15.4-56.4-22.2-86-19H0v6.9C17.9,11.8,36.3,13.5,53.6,18.8z" />
            </svg>
          </figure>
          <figure className="position-absolute top-0 start-0 mt-3 ms-n3 opacity-5">
            <svg width="818.6px" height="235.1px" viewBox="0 0 818.6 235.1">
              <path className="fill-orange" d="M735,226.3c-5.7,0.6-11.5,1.1-17.2,1.7c-66.2,6.8-134.7,13.7-192.6-16.6c-34.6-18.1-61.4-47.9-87.3-76.7 c-21.4-23.8-43.6-48.5-70.2-66.7c-53.2-36.4-121.6-44.8-175.1-48c-13.6-0.8-27.5-1.4-40.9-1.9c-46.9-1.9-95.4-3.9-141.2-16.5 C8.3,1.2,6.2,0.6,4.2,0H0c3.3,1,6.6,2,10,3c46,12.5,94.5,14.6,141.5,16.5c13.4,0.6,27.3,1.1,40.8,1.9 c53.4,3.2,121.5,11.5,174.5,47.7c26.5,18.1,48.6,42.7,70,66.5c26,28.9,52.9,58.8,87.7,76.9c58.3,30.5,127,23.5,193.3,16.7 c5.8-0.6,11.5-1.2,17.2-1.7c26.2-2.6,55-4.2,83.5-2.2v-1.2C790,222,761.2,223.7,735,226.3z" />
            </svg>
          </figure>
          <Row className="g-4 position-relative align-items-center justify-content-center">
            {counterData.map((item, idx) => <CounterCard key={idx} {...item} />)}
          </Row>
        </div>
      </Container>
    </section>;
};
export default Counter;
