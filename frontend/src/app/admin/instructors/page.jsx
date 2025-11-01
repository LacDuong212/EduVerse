import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import AllInstructors from './components/AllInstructors';
const InstructorPage = () => {
  return <>
      <PageMetaData title="Instructor" />
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Instructors</h1>
        </Col>
      </Row>
      <AllInstructors />
    </>;
};
export default InstructorPage;
