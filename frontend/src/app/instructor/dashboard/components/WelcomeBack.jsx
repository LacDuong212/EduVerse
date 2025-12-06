import element31 from '@/assets/images/element/31.svg';
import blob7 from '@/assets/images/pattern/07.svg';
import { INSTRUCTOR_WELCOME_SENTENCES } from '@/context/constants';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';


const WelcomeBack = ({ instructorName = "" }) => {
  const shape = {
    position: 'absolute',
    bottom: '-10%',
    right: '15%',
    zIndex: 0
  };

  const [randomSaying, setRandomSaying] = useState("");

  useEffect(() => {
    setRandomSaying(INSTRUCTOR_WELCOME_SENTENCES[Math.floor(Math.random() * INSTRUCTOR_WELCOME_SENTENCES.length)]);
  }, []);

  return (
    <section className="pt-3 pt-lg-5">
      <Row className="g-4 align-items-center position-relative mb-lg-3">
        {/* LEFT SIDE */}
        <Col md={7} className="position-relative z-index-9">
          <h2>Welcome back{instructorName ? `, ${instructorName}` : ""}!</h2>
          <div>
            <p className="text-secondary fs-5">{randomSaying}</p>
          </div>
        </Col>

        <figure className="fill-warning position-absolute bottom-0 start-50 d-none d-xl-block" style={{ zIndex: 0 }}>
          <svg width="42px" height="42px">
            <path d="M21.000,-0.001 L28.424,13.575 L41.999,20.999 L28.424,28.424 L21.000,41.998 L13.575,28.424 L-0.000,20.999 L13.575,13.575 L21.000,-0.001 Z" />
          </svg>
        </figure>

        {/* RIGHT SIDE */}
        <Col md={5} className="text-md-end position-relative mt-0">
          <figure className="ms-5" style={shape}>
            <img src={blob7} />
          </figure>
          <img src={element31} width="450px" className="position-relative" alt="decorative element" />
        </Col>
      </Row>
    </section>
  );
};

export default WelcomeBack;
