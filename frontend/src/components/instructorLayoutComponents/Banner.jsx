import patternImg from '@/assets/images/pattern/04.png';

import { Card, Col, Container, Row } from 'react-bootstrap';
import { BsPatchCheckFill } from 'react-icons/bs';
import { FaBook, FaSlidersH, FaStar, FaUserGraduate } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const Banner = ({
  toggleOffCanvas,
  accountData
}) => {
  return (
    <section className="pt-0">
      {/* Banner Background */}
      <Container fluid className="px-0">
        <div className="bg-blue h-100px h-md-200px rounded-0"
          style={{
            background: `url(${patternImg}) no-repeat center center`,
            backgroundSize: 'cover'
          }}></div>
      </Container>

      {/* Banner Content */}
      <Container className="mt-n4">
        <Row>
          <Col xs={12}>
            <Card className="bg-transparent card-body p-0">
              <Row className="d-flex justify-content-between">
                <Col xs={'auto'} className="mt-4 mt-md-0">
                  <div className="avatar avatar-xxl mt-n3">
                    {accountData?.pfpImg ? (
                      <img
                        className="avatar-img rounded-circle border border-light border-3 shadow"
                        src={accountData.pfpImg}
                        alt="Instructor Avatar" />
                    ) : (
                      <div className="avatar-img rounded-circle border border-light border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-1">
                        {(accountData?.name?.[0] || "I").toUpperCase()}
                      </div>
                    )}
                  </div>
                </Col>
                <Col className="d-md-flex justify-content-between align-items-center mt-4">
                  <div>
                    <h1 className="my-1 fs-4">
                      {accountData?.name} <BsPatchCheckFill className="text-info small" />
                    </h1>
                    <ul className="list-inline mb-0">
                      <li className="list-inline-item h6 fw-light me-3 mb-1 mb-sm-0">
                        <FaStar className="text-warning me-2" />
                        {accountData?.averageRating}
                      </li>
                      <li className="list-inline-item h6 fw-light me-3 mb-1 mb-sm-0">
                        <FaUserGraduate className="text-orange me-2" />
                        {accountData?.totalStudents}
                      </li>
                      <li className="list-inline-item h6 fw-light me-3 mb-1 mb-sm-0">
                        <FaBook className="text-purple me-2" />
                        {accountData?.totalCourses}
                      </li>
                    </ul>
                  </div>
                  <div className="d-flex align-items-center mt-2 mt-md-0">
                    <Link to="/instructor/courses/create" className="btn btn-success mb-0">
                      Create a course
                    </Link>
                  </div>
                </Col>
              </Row>
            </Card>
            <hr className="d-xl-none" />
            <Col xs={12} xl={3} className="d-flex justify-content-between align-items-center">
              <a className="h6 mb-0 fw-bold d-xl-none" href="#">Menu</a>
              <button onClick={toggleOffCanvas} className="btn btn-primary d-xl-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar">
                <FaSlidersH />
              </button>
            </Col>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;
