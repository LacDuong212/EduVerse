import clsx from 'clsx';
import { Col, Container, Row } from 'react-bootstrap';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import logo from '@/assets/images/logo/logo.svg';
import logoLight from '@/assets/images/logo/logo_light.svg';
import { currentYear, SUPPORT_EMAIL, TEAM_NAME } from '@/contexts/constants';

const Footer = ({
  className
}) => {
  return (
    <footer className={clsx('', className)}>
      <Container>
        <Row>
          <Col lg={3}>
            <Link className="me-0" to="/home">
              <img className="light-mode-item h-40px" width={189} height={40} src={logo} alt="logo" />
              <img className="dark-mode-item h-40px" width={189} height={40} src={logoLight} alt="logo" />
            </Link>
            <p className="my-3">
              Learn here and now.
            </p>
            <ul className="list-inline mb-0 mt-3">
              <li className="list-inline-item">
                <a className="btn btn-white btn-sm shadow px-2 text-facebook">
                  <FaFacebookF className="fa-fw" />
                </a>
              </li>
              <li className="list-inline-item">
                <a className="btn btn-white btn-sm shadow px-2 text-instagram">
                  <FaInstagram className="fa-fw" />
                </a>
              </li>
              <li className="list-inline-item">
                <a className="btn btn-white btn-sm shadow px-2 text-twitter">
                  <FaTwitter className="fa-fw" />
                </a>
              </li>
              <li className="list-inline-item">
                <a className="btn btn-white btn-sm shadow px-2 text-linkedin">
                  <FaLinkedinIn className="fa-fw" />
                </a>
              </li>
            </ul>
          </Col>
          <Col lg={6}>
            <Row className="g-4">
              <Col>
                <h5 className="mb-2 mb-md-3">Teaching</h5>
                <ul className="nav flex-column">
                  <li className="nav-item p-0">
                    <Link className="nav-link p-0" to="/student/become-instructor">Become an Instructor</Link>
                  </li>
                  <li className="nav-item p-0 mt-2">
                    <Link className="nav-link p-0" to="">Terms & Conditions</Link>
                  </li>
                </ul>
              </Col>
              <Col>
                <h5 className="mb-2 mb-md-3">Contact</h5>
                <p className="mb-2">
                  Toll free:<span className="h6 fw-light ms-2">0xxxxxx911</span>
                  <span className="d-block small">(9:AM to 6:PM UTC+7)</span>
                </p>
                <p className="mb-0">
                  Email:<span className="ms-2">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-primary text-decoration-none fw-semibold"
                    >
                      {SUPPORT_EMAIL}
                    </a>{" "}
                  </span>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <hr className="mt-3 mb-0" />
        <div className="text-center py-3">
          <span className="d-inline-block me-1">
            Copyrights ©2026 EduVerse.
          </span>
          <span className="d-inline-block">
            Modified with 💙 by <span className="text-primary font-monospace">{TEAM_NAME}</span>.
          </span>
        </div>
      </Container>
    </footer>
  );
};
export default Footer;
