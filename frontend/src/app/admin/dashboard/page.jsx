import { Col, Row } from 'react-bootstrap';
import Counter from './components/Counter';
import Earnings from './components/Earnings';
import TopInstructors from './components/TopInstructors';
import PageMetaData from '@/components/PageMetaData';
const AdminDashboardPage = () => {
  return <>
      <PageMetaData title="Admin Dashboard" />
      <Row>
        <Col xs={12} className=" mb-3">
          <h1 className="h3 mb-2 mb-sm-0">Dashboard</h1>
        </Col>
      </Row>
      <Counter />
      {/* <Row className="g-4 mb-4">
        <Earnings />
        <TopInstructors />
      </Row> */}
      <Earnings />
    </>;
};
export default AdminDashboardPage;
