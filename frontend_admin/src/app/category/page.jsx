import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import AllCategories from './components/AllCategories';

const CategoryPage = () => {
  return (
    <>
      <PageMetaData title="Category Management" />
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Categories</h1>
        </Col>
      </Row>
      <AllCategories />
    </>
  );
};

export default CategoryPage;