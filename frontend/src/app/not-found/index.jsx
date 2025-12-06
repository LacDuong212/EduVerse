import error404Img from '@/assets/images/element/error404.svg';
import { Col, Container, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return <>
    <section>
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <img src={error404Img} className="h-300px mb-4" alt="error404" />
            <h2 className="display-1 text-danger mb-0">404</h2>
            <h3>Page not found!</h3>
            <p className="mb-4">Either something went wrong or the page you are looking for doesn&apos;t exist.</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary mb-0">
              Return
            </button>
          </Col>
        </Row>
      </Container>
    </section>
  </>;
};

export default NotFoundPage;
