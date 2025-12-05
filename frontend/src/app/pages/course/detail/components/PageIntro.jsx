import { Col, Container, Row } from 'react-bootstrap';
import { BsPatchExclamationFill } from 'react-icons/bs';
import { FaGlobe, FaSignal, FaStar, FaUserGraduate } from 'react-icons/fa';
import pattern4 from '@/assets/images/pattern/04.png';

const PageIntro = ({ course }) => {

  return <section className="bg-blue py-0 py-sm-5 text-white"style={{
      background: `url(${pattern4}) no-repeat center center`,
      backgroundSize: 'cover'
    }}>
    <Container>
      <Row className="py-5">
        <Col lg={8}>
          <h6 className="mb-3 font-base bg-primary text-white py-2 px-4 rounded-2 d-inline-block">{course?.category?.name ?? 'General'}</h6>
          <h1 className='text-white'>{course?.title}</h1>
          <p>{course?.subtitle}</p>
          <ul className="list-inline mb-0">
            <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center text-white">
              <FaStar className="text-warning me-2" />
              {Number(course?.rating?.average || 0).toFixed(1)}/5.0              </li>
            <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center text-white">
              <FaUserGraduate className="text-orange me-2" />
              {course?.studentsEnrolled ?? '0'} Enrolled
            </li>
            <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center text-white">
              <FaSignal size={16} className="text-success me-2" />
              {course?.level ?? 'All levels'}
            </li>
            <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center text-white">
              <BsPatchExclamationFill className="text-danger me-2" />
              Last updated {new Date(course?.updatedAt).toLocaleDateString() || 'N/A'}
            </li>
            <li className="list-inline-item h6 mb-0 icons-center text-white">
              <FaGlobe className="text-info me-2" />
              {course?.language ?? 'English'}
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default PageIntro;
