import { Col, Container, Row } from 'react-bootstrap';
import pattern4 from '@/assets/images/pattern/04.png';


const Banner = () => {
  return <section className="bg-blue align-items-center d-flex" style={{
    background: `url(${pattern4}) no-repeat center center`,
    backgroundSize: 'cover'
  }}>
    <Container>
      <Row>
        <Col xs={12} className="text-center">
          <h1 className="m-0 text-light">Checkout</h1>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default Banner;
