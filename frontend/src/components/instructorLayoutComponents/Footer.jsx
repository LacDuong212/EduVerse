import { Col, Container, Row } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoLight from "@/assets/images/logo/logo_light.svg";
import { TEAM_NAME } from "@/contexts/constants";

const Footer = () => {
  return (
    <footer className="bg-dark p-3">
      <Container>
        <Row className="align-items-center g-2 g-md-0">
          <Col sm={3} md={4} className="text-center text-md-start mb-md-0">
            <Link to="/home">
              <img className="h-20px" src={logoLight} height={20} width={94} alt="logo" />
            </Link>
          </Col>
          <Col sm={6} md={4} className="mb-md-0">
            <div className="text-center text-white">
              <span className="d-inline-block me-1">
                Copyrights ©2026 EduVerse.
              </span>
              <span className="d-inline-block">
                Modified with 💙 by <span className="text-primary font-monospace">{TEAM_NAME}</span>.
              </span>
            </div>
          </Col>
          <Col sm={3} md={4}>
            <ul className="list-inline mb-0 text-center text-md-end">
              <li className="list-inline-item">
                <Link to="">
                  <FaFacebook className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item">
                <Link to="">
                  <FaInstagram className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item">
                <Link to="">
                  <FaLinkedinIn className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item">
                <Link to="">
                  <FaTwitter className="text-white" />
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;