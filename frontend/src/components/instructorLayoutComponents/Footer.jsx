import { Col, Container, Row } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import logoLight from "@/assets/images/logo/logo_light.svg";
import { TEAM_NAME } from "@/contexts/constants";

const Footer = () => {
  return (
    <footer className="bg-dark p-3">
      <Container>
        <Row className="align-items-center">
          <Col md={3} className="text-center text-md-start mb-3 mb-md-0">
            <Link to="/home">
              <img className="h-20px" src={logoLight} height={20} width={94} alt="logo" />
            </Link>
          </Col>
          <Col md={5} className="mb-3 mb-md-0">
            <div className="text-center text-white">
              <div>
                Copyrights ©2026 EduVerse.
              </div>
              <div>
                Modified with 💙 by <span className="text-primary font-monospace">{TEAM_NAME}</span>. {/*Originally Eduport, built by StackBros*/}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <ul className="list-inline mb-0 text-center text-md-end">
              <li className="list-inline-item ms-2">
                <Link to="">
                  <FaFacebook className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item ms-2">
                <Link to="">
                  <FaInstagram className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item ms-2">
                <Link to="">
                  <FaLinkedinIn className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item ms-2">
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