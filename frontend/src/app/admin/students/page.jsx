import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import AllStudents from './components/AllStudents';
const StudentPage = () => {
  return <>
      <PageMetaData title="Student" />
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Students</h1>
        </Col>
      </Row>
      <AllStudents />
    </>;
};
export default StudentPage;
