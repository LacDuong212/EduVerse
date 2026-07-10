import clsx from 'clsx';
import { Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { FaChevronUp, FaFacebookF, FaGlobe, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { footerLinks } from '@/assets/data/footer-items';
import logo from '@/assets/images/logo/logo.svg';
import logoLight from '@/assets/images/logo/logo_light.svg';
import playStore from '@/assets/images/client/app-store.svg';
import googlePlay from '@/assets/images/client/google-play.svg';
import { currentYear, TEAM_NAME, SUPPORT_EMAIL } from '@/contexts/constants';

const Footer = ({
  className
}) => {
  return (
    <footer className={clsx('', className)}>
      <Container>
        <Row className="g-4">
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
              {footerLinks.map((link, idx) => <Col xs={6} md={4} key={idx}>
                <h5 className="mb-2 mb-md-4">{link.title}</h5>
                <ul className="nav flex-column">
                  {link.items.map((item, idx) => <li className="nav-item" key={idx}>
                    <Link className="nav-link" to={item.link ?? ""}>
                      {item.name}
                    </Link>
                  </li>)}
                </ul>
              </Col>)}
            </Row>
          </Col>
          <Col lg={3}>
            <h5 className="mb-2 mb-md-4">Contact</h5>
            <p className="mb-2">
              Toll free:<span className="h6 fw-light ms-2">0345476211</span>
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
            {/* <Row className="g-2 mt-2">
              <Col xs={6} sm={4} md={3} lg={6}>
                <span role="button">
                  <img height={45} width={145} className="w-auto" src={googlePlay} alt="google-play" />
                </span>
              </Col>
              <Col xs={6} sm={4} md={3} lg={6}>
                <span role="button">
                  <img height={45} width={145} className="w-auto" src={playStore} alt="app-store" />
                </span>
              </Col>
            </Row> */}
          </Col>
        </Row>
        <hr className="mt-4 mb-0" />
        <div className="py-3">
          <Container className="px-0">
            <div className="d-lg-flex justify-content-between align-items-center text-center text-md-left">
              <div className="text-body text-primary-hover">
                Copyrights ©{currentYear} EduVerse. Modified with 💙 by <span className="text-primary font-monospace">{TEAM_NAME}</span>. {/*Originally Eduport, built by StackBros*/}
              </div>
            </div>
          </Container>
        </div>
      </Container>
    </footer>
  );
};
export default Footer;
