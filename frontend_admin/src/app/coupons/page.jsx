import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import AllCoupons from './components/AllCoupons';

const CouponPage = () => {
  return (
    <>
      <PageMetaData title="Coupon Management" />
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Coupons</h1>
        </Col>
      </Row>
      <AllCoupons />
    </>
  );
};

export default CouponPage;