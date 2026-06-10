import { Col, Row } from 'react-bootstrap';
import Counter from './components/Counter';
import Earnings from './components/Earnings';
import PageMetaData from '@/components/PageMetaData';
import { BsSpeedometer2 } from 'react-icons/bs';
const AdminDashboardPage = () => {
  return <>
      <PageMetaData title="Admin Dashboard" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <BsSpeedometer2 className="text-primary" size={22} /> Dashboard
          </h1>
          <p className="page-subtitle mb-0">Platform overview &amp; key metrics</p>
        </div>
      </div>
      <Counter />
      <Earnings />
    </>;
};
export default AdminDashboardPage;
