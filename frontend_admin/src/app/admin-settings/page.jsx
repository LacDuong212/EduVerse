import { Col, Row } from 'react-bootstrap';
import PageMetaData from '@/components/PageMetaData';
import AccountSetting from './components/AccountSetting';
const AdminSettingsPage = () => {
  return <>
      <PageMetaData title="Admin Setting" />
      <Row>
        <Col xs={12} className="mb-3">
          <h1 className="h3 mb-2 mb-sm-0">Admin Settings</h1>
        </Col>
      </Row>
      <AccountSetting />
    </>;
};
export default AdminSettingsPage;
