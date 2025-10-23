import { Card, CardBody, Col, Row } from 'react-bootstrap';
import instructor1 from '@/assets/images/instructor/01.jpg';
import { FaCommentDots, FaFacebookSquare, FaInstagramSquare, FaLinkedin, FaPlay, FaStar, FaTwitterSquare, FaUserGraduate, FaYoutubeSquare } from 'react-icons/fa';
const Instructor = () => {
  return <>
      <Card className="mb-0 mb-md-4">
        <Row className="g-0 align-items-center">
          <Col md={5}>
            <img src={instructor1} className="img-fluid rounded-3" alt="instructor-image" />
          </Col>
          <Col md={7}>
            <CardBody>
              <h3 className="card-title mb-0">Louis Ferguson</h3>
              <p className="mb-2">Instructor of Marketing</p>
              <ul className="list-inline mb-3">
                <li className="list-inline-item me-3">
                  <a href="#" className="fs-5 text-twitter">
                    <FaTwitterSquare />
                  </a>
                </li>
                <li className="list-inline-item me-3">
                  <a href="#" className="fs-5 text-instagram">
                    <FaInstagramSquare />
                  </a>
                </li>
                <li className="list-inline-item me-3">
                  <a href="#" className="fs-5 text-facebook">
                    <FaFacebookSquare />
                  </a>
                </li>
                <li className="list-inline-item me-3">
                  <a href="#" className="fs-5 text-linkedin">
                    <FaLinkedin />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="fs-5 text-youtube">
                    <FaYoutubeSquare />
                  </a>
                </li>
              </ul>
              <ul className="list-inline">
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <span className="icon-md bg-orange bg-opacity-10 text-orange rounded-circle">
                      <FaUserGraduate />
                    </span>
                    <span className="h6 fw-light mb-0 ms-2">9.1k</span>
                  </div>
                </li>
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <span className="icon-md bg-warning bg-opacity-15 text-warning rounded-circle">
                      <FaStar />
                    </span>
                    <span className="h6 fw-light mb-0 ms-2">4.5</span>
                  </div>
                </li>
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <span className="icon-md bg-danger bg-opacity-10 text-danger rounded-circle">
                      <FaPlay />
                    </span>
                    <span className="h6 fw-light mb-0 ms-2">29 Courses</span>
                  </div>
                </li>
                <li className="list-inline-item">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <span className="icon-md bg-info bg-opacity-10 text-info rounded-circle">
                      <FaCommentDots />
                    </span>
                    <span className="h6 fw-light mb-0 ms-2">205</span>
                  </div>
                </li>
              </ul>
            </CardBody>
          </Col>
        </Row>
      </Card>
      <h5 className="mb-3">About Instructor</h5>
      <p className="mb-3">
        Fulfilled direction use continual set him propriety continued. Saw met applauded favorite deficient engrossed concealed and her. Concluded boy
        perpetual old supposing. Farther related bed and passage comfort civilly. Dashboard see frankness objection abilities. As hastened oh produced
        prospect formerly up am. Placing forming nay looking old married few has. Margaret disposed of add screened rendered six say his striking
        confined.
      </p>
      <p className="mb-3">
        As it so contrasted oh estimating instrument. Size like body someone had. Are conduct viewing boy minutes warrant the expense? Tolerably
        behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted.
      </p>
      <Col xs={12}>
        <ul className="list-group list-group-borderless mb-0">
          <li className="list-group-item pb-0">
            Mail ID:
            <a href="#" className="ms-2">
              hello@email.com
            </a>
          </li>
          <li className="list-group-item pb-0">
            Web:
            <a href="#" className="ms-2">
              https://eduport.com
            </a>
          </li>
        </ul>
      </Col>
    </>;
};
export default Instructor;
