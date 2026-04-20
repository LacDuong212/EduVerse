import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { BsTriangleFill } from "react-icons/bs";
import { FaReact } from "react-icons/fa";
import { IoStatsChartSharp } from "react-icons/io5";
import { PiGlobeThin, PiPentagon } from "react-icons/pi";
import element31 from "@/assets/images/element/31.svg";
import blob7 from "@/assets/images/pattern/07.svg";
import { INSTRUCTOR_WELCOME_SENTENCES } from "@/contexts/constants";

const WelcomeBack = ({ instructorName = "" }) => {
  const styles = {
    wrapper: {
      position: "relative",
      border: "none",
    },
    shape1: {
      position: "absolute",
      top: "50%",
      right: "7%",
      fontSize: "3rem",
      transform: "rotate(45deg)",
      opacity: "0.5",
      zIndex: 0
    },
    shape2: {
      position: "absolute",
      bottom: "10%",
      left: "7%",
      fontSize: "6rem",
      transform: "rotate(-25deg)",
      opacity: "0.5",
      zIndex: 0
    },
    shape3: {
      position: "absolute",
      top: "10px",
      left: "25%",
      fontSize: "4rem",
      opacity: "0.5",
      zIndex: 0
    },
    shape4: {
      position: "absolute",
      top: "92px",
      left: "45%",
      fontSize: "3rem",
      transform: "rotate(10deg)",
      opacity: "0.5",
      zIndex: 0
    },
    shape5: {
      position: "absolute",
      top: "25%",
      right: "3%",
      fontSize: "5rem",
      transform: "rotate(60deg)",
      opacity: "0.5",
      zIndex: 0
    },
  };

  const shapeBg = {
    position: "absolute",
    bottom: "-20%",
    right: "15%",
    zIndex: 0
  };

  const [randomSaying, setRandomSaying] = useState("");

  useEffect(() => {
    setRandomSaying(INSTRUCTOR_WELCOME_SENTENCES[Math.floor(Math.random() * INSTRUCTOR_WELCOME_SENTENCES.length)]);
  }, []);

  return (
    <section className="pt-4 pb-4" style={styles.wrapper}>
      <PiGlobeThin className="text-pink" style={styles.shape1} />
      <IoStatsChartSharp className="text-teal" style={styles.shape2} />
      <FaReact className="text-yellow" style={styles.shape3} />
      <BsTriangleFill className="text-orange" style={styles.shape4} />
      <PiPentagon className="text-purple" style={styles.shape5} />

      <Container>
        <Row className="g-4 align-items-center mb-lg-3">
          {/* LEFT SIDE */}
          <Col md={7} className="position-relative z-index-9">
            <h2>Welcome back{instructorName ? `, ${instructorName}` : ""}!</h2>
            <div>
              <p className="text-body fs-5">{randomSaying}</p>
            </div>
          </Col>

          <figure className="fill-warning position-absolute bottom-0 start-50 d-none d-xl-block" style={{ zIndex: 0 }}>
            <svg width="42px" height="42px">
              <path d="M21.000,-0.001 L28.424,13.575 L41.999,20.999 L28.424,28.424 L21.000,41.998 L13.575,28.424 L-0.000,20.999 L13.575,13.575 L21.000,-0.001 Z" />
            </svg>
          </figure>

          {/* RIGHT SIDE */}
          <Col md={5} className="text-md-end position-relative mt-0">
            <figure className="ms-5" style={shapeBg}>
              <img src={blob7} />
            </figure>
            <img src={element31} width="450px" className="position-relative" alt="decorative element" />
          </Col>
        </Row>
      </Container>


    </section>
  );
};

export default WelcomeBack;