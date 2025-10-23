import error404Img from '@/assets/images/element/error404.svg';
// import Footer from './components/Footer';
// import TopNavigationBar from './components/TopNavigationBar';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const NotFoundPage = () => {
  return <>
      {/* <TopNavigationBar /> */}
      <main>
        <section className="pt-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center">
                <img src={error404Img} className="h-200px h-md-400px mb-4" alt="error404" />
                <h1 className="display-1 text-danger mb-0">404</h1>
                <h2>Oh no, something went wrong!</h2>
                <p className="mb-4">Either something went wrong or this page doesn&apos;t exist anymore.</p>
                <Link to="/" className="btn btn-primary mb-0">
                  Take me to Homepage
                </Link>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      {/* <Footer className="pt-5 bg-light" /> */}
    </>;
};

export default NotFoundPage;
