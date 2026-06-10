import PageMetaData from '@/components/PageMetaData';
import { FaTag } from 'react-icons/fa';
import AllCoupons from './components/AllCoupons';

const CouponPage = () => {
  return (
    <>
      <PageMetaData title="Coupon Management" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaTag className="text-success" size={20} /> Coupons
          </h1>
          <p className="page-subtitle mb-0">Manage discount coupons &amp; promotions</p>
        </div>
      </div>
      <AllCoupons />
    </>
  );
};

export default CouponPage;