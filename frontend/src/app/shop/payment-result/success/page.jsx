import successImg from '@/assets/images/element/payment-success.svg';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
  return (
    <>
      <main>
        <section className="pt-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center">
                <img
                  src={successImg}
                  className="h-200px h-md-440px mb-4"
                  alt="payment success"
                />
                <h1 className="display-4 text-success mb-2">Payment Successful!</h1>
                <h4 className="mb-3">Thank you for your purchase</h4>
                <p className="mb-4">
                  Your payment was processed successfully. You can now access your course.
                </p>
                <Link to="/student/courses" className="btn btn-success mb-0">
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

export default PaymentSuccessPage;
