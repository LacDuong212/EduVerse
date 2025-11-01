import error404Img from '@/assets/images/element/error404.svg';
import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const NotFound = () => {
  return <>
      <PageMetaData title="Not Found" />
      <Row>
        <Col xl={12} className="text-center">
          <img src={error404Img} className="h-200px h-md-400px mb-4" alt="error404" />
          <h1 className="display-1 text-danger mb-0">404</h1>
          <h2>Oh no, something went wrong!</h2>
          <p className="mb-4">Either something went wrong or this page doesn&apos;t exist anymore.</p>
          <Link to="/admin/dashboard" className="btn btn-primary mb-0">
            Go to Dashboard
          </Link>
        </Col>
      </Row>
    </>;
};
export default NotFound;
