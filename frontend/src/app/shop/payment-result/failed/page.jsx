import failedImg from '@/assets/images/element/payment-failed.svg';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PaymentFailedPage = () => {
  return (
    <>
      <main>
        <section className="pt-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center">
                <img
                  src={failedImg}
                  className="h-200px h-md-400px mb-4"
                  alt="payment failed"
                />
                <h1 className="display-4 text-danger mb-2">Payment Failed</h1>
                <h4 className="mb-3">Oops! Something went wrong 😢</h4>
                <p className="mb-4">
                  We couldn’t process your payment. Please try again or contact support.
                </p>
                <Link to="/student/courses" className="btn btn-danger mb-0">
                  Go to My Course
                </Link>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </>
  );
};

export default PaymentFailedPage;
