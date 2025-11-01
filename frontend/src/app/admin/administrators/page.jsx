import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import AllAdministrators from './components/AllAdministrators';
const AdminstratorPage = () => {
  return <>
      <PageMetaData title="Administrator" />
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Administrators</h1>
        </Col>
      </Row>
      <AllAdministrators />
    </>;
};
export default AdminstratorPage;