import { Col, Container, Row } from 'react-bootstrap';
import { FaQuoteLeft, FaQuoteRight, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import avatar1 from '@/assets/images/avatar/01.jpg';
import { BsShieldFillCheck } from 'react-icons/bs';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar9 from '@/assets/images/avatar/09.jpg';
import pattern2 from '@/assets/images/pattern/02.png';
const Reviews = () => {
  return <section className="bg-light">
      <Container>
        <Row className="g-4 g-lg-5 align-items-center">
          <Col xl={7} className="order-2 order-xl-1">
            <Row className="mt-0 mt-xl-5">
              <Col md={7} className="position-relative mb-0 mt-0 mt-md-5">
                <figure className="fill-danger opacity-2 position-absolute top-0 start-0 translate-middle mb-3">
                  <svg width="211px" height="211px">
                    <path d="M210.030,105.011 C210.030,163.014 163.010,210.029 105.012,210.029 C47.013,210.029 -0.005,163.014 -0.005,105.011 C-0.005,47.015 47.013,-0.004 105.012,-0.004 C163.010,-0.004 210.030,47.015 210.030,105.011 Z" />
                  </svg>
                </figure>
                <div className="bg-body shadow text-center p-4 rounded-3 position-relative mb-5 mb-md-0">
                  <div className="avatar avatar-xl mb-3">
                    <img className="avatar-img rounded-circle" src={avatar1} alt="avatar" />
                  </div>
                  <blockquote>
                    <p>
                      <span className="me-1 small">
                        <FaQuoteLeft />
                      </span>
                      Moonlight newspaper up its enjoyment agreeable depending. Timed voice share led him to widen noisy young. At weddings believed
                      laughing
                      <span className="ms-1 small">
                        <FaQuoteRight />
                      </span>
                    </p>
                  </blockquote>
                  <ul className="list-inline mb-2">
                    {Array(Math.floor(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                          <FaStar size={14} className="text-warning" />
                        </li>)}
                    {!Number.isInteger(4.5) && <li className="list-inline-item me-1 small">

                        <FaStarHalfAlt size={14} className="text-warning" />
                      </li>}
                    {4.5 < 5 && Array(5 - Math.ceil(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                            <FaRegStar size={14} className="text-warning" />
                          </li>)}
                  </ul>
                  <h6 className="mb-0">Carolyn Ortiz</h6>
                </div>
              </Col>
              <Col md={5} className="mt-5 mt-md-0 d-none d-md-block">
                <div className="bg-body shadow p-4 rounded-3 d-inline-block position-relative">
                  <div className="icon-lg bg-warning rounded-circle position-absolute top-0 start-100 translate-middle">
                    <BsShieldFillCheck className="text-dark" />
                  </div>
                  <h6 className="mb-3">100+ Verified Mentors</h6>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-sm">
                      <img className="avatar-img rounded-1" src={avatar9} alt="avatar" />
                    </div>
                    <div className="ms-2">
                      <h6 className="mb-0">Lori Stevens</h6>
                      <p className="mb-0 small">Tutor of physic</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-sm">
                      <img className="avatar-img rounded-1" src={avatar4} alt="avatar" />
                    </div>
                    <div className="ms-2">
                      <h6 className="mb-0">Billy Vasquez</h6>
                      <p className="mb-0 small">Tutor of chemistry</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm">
                      <img className="avatar-img rounded-1" src={avatar2} alt="avatar" />
                    </div>
                    <div className="ms-2">
                      <h6 className="mb-0">Larry Lawson</h6>
                      <p className="mb-0 small">Tutor of technology</p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <Row className="mt-5 mt-xl-0">
              <Col xs={7} className="mt-0 mt-xl-5 text-end position-relative z-index-1 d-none d-md-block">
                <figure className="fill-danger position-absolute top-0 start-50 mt-n7 ms-6 ps-3 pt-2 z-index-n1 d-none d-lg-block">
                  <svg enableBackground="new 0 0 160.7 159.8" height="180px">
                    <path d="m153.2 114.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m116.4 114.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m134.8 114.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m135.1 96.9c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m153.5 96.9c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m98.3 96.9c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <ellipse cx="116.7" cy="99.1" rx="2.1" ry="2.2" />
                    <path d="m153.2 149.8c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.3 0.9-2.2 2.1-2.2z" />
                    <path d="m135.1 132.2c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2 0-1.3 0.9-2.2 2.1-2.2z" />
                    <path d="m153.5 132.2c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.3 0.9-2.2 2.1-2.2z" />
                    <path d="m80.2 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2z" />
                    <path d="m117 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m98.6 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m135.4 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m153.8 79.3c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m80.6 61.7c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <ellipse cx="98.9" cy="63.9" rx="2.1" ry="2.2" />
                    <path d="m117.3 61.7c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <ellipse cx="62.2" cy="63.9" rx="2.1" ry="2.2" />
                    <ellipse cx="154.1" cy="63.9" rx="2.1" ry="2.2" />
                    <path d="m135.7 61.7c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m154.4 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m80.9 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m44.1 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m99.2 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2z" />
                    <ellipse cx="117.6" cy="46.3" rx="2.1" ry="2.2" />
                    <path d="m136 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m62.5 44.1c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m154.7 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <path d="m62.8 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <ellipse cx="136.3" cy="28.6" rx="2.1" ry="2.2" />
                    <path d="m99.6 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m117.9 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2z" />
                    <path d="m81.2 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2-0.1-1.2 0.9-2.2 2.1-2.2z" />
                    <path d="m26 26.5c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2c-1.2 0-2.1-1-2.1-2.2s0.9-2.2 2.1-2.2z" />
                    <ellipse cx="44.4" cy="28.6" rx="2.1" ry="2.2" />
                    <path d="m136.6 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
                    <path d="m155 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
                    <path d="m26.3 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
                    <path d="m81.5 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
                    <path d="m63.1 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
                    <path d="m44.7 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-0.9 2.2-2.1 2.2z" />
                    <path d="m118.2 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
                    <path d="m7.9 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2 0.1 1.2-0.9 2.2-2.1 2.2z" />
                    <path d="m99.9 13.2c-1.2 0-2.1-1-2.1-2.2s1-2.2 2.1-2.2c1.2 0 2.1 1 2.1 2.2s-1 2.2-2.1 2.2z" />
                  </svg>
                </figure>
                <div className="p-3 bg-primary d-inline-block rounded-4 shadow-lg text-center" style={{
                background: `url(${pattern2}) no-repeat center center`,
                backgroundSize: 'cover'
              }}>
                  <h5 className="text-white mb-0">4.5/5.0</h5>
                  <ul className="list-inline mb-2">
                    {Array(Math.floor(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                          <FaStar size={14} className="text-warning" />
                        </li>)}
                    {!Number.isInteger(4.5) && <li className="list-inline-item me-1 small">

                        <FaStarHalfAlt size={14} className="text-warning" />
                      </li>}
                    {4.5 < 5 && Array(5 - Math.ceil(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                            <FaRegStar size={14} className="text-warning" />
                          </li>)}
                  </ul>
                  <p className="text-white mb-0">Based on 3265 ratings</p>
                </div>
              </Col>
              <Col md={5} className="mt-n6 mb-0 mb-md-5">
                <div className="bg-body shadow text-center p-4 rounded-3">
                  <div className="avatar avatar-xl mb-3">
                    <img className="avatar-img rounded-circle" src={avatar3} alt="avatar" />
                  </div>
                  <blockquote>
                    <p>
                      <span className="me-1 small">
                        <FaQuoteLeft />
                      </span>
                      At weddings believed laughing although the Moonlight newspaper up its enjoyment agreeable depending.
                      <span className="ms-1 small">
                        <FaQuoteRight />
                      </span>
                    </p>
                  </blockquote>
                  <ul className="list-inline mb-2">
                    {Array(Math.floor(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                          <FaStar size={14} className="text-warning" />
                        </li>)}
                    {!Number.isInteger(4.5) && <li className="list-inline-item me-1 small">

                        <FaStarHalfAlt size={14} className="text-warning" />
                      </li>}
                    {4.5 < 5 && Array(5 - Math.ceil(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                            <FaRegStar size={14} className="text-warning" />
                          </li>)}
                  </ul>
                  <h6 className="mb-0">Dennis Barrett</h6>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xl={5} className="order-1 text-center text-xl-start">
            <h2 className="fs-1">Some valuable feedback from our students</h2>
            <p>
              Supposing so be resolving breakfast am or perfectly. It drew a hill from me. Valley by oh twenty direct me so. Departure defective
              arranging rapturous did believe him all had supported. Family months lasted simple set nature vulgar him. Picture for attempt joy
              excited ten carried manners talking how.
            </p>
            <a href="#" className="btn btn-primary mb-0">
              View Reviews
            </a>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default Reviews;
