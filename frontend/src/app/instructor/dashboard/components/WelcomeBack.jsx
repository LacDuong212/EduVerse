import pattern6 from '@/assets/images/pattern/06.svg';
import element31 from '@/assets/images/element/31.svg';
import blob7 from '@/assets/images/pattern/07.svg';
import { INSTRUCTOR_WELCOME_SENTENCES } from '@/context/constants';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';


const WelcomeBack = ({ instructorName = "" }) => {
  const [randomSaying, setRandomSaying] = useState("");

  useEffect(() => {
    setRandomSaying(INSTRUCTOR_WELCOME_SENTENCES[Math.floor(Math.random() * INSTRUCTOR_WELCOME_SENTENCES.length)]);
  }, []);

  return (
    <section>
      <Row className="g-4 align-items-center position-relative mb-5">
        <figure className="position-absolute top-50 start-0 translate-middle-y ms-n9 d-none d-xxl-block">
          <img
            src={pattern6}
            alt="decorative pattern"
            className="opacity-25"
            style={{
              transform: 'rotate(74deg)',
              filter: 'invert(64%) sepia(67%) saturate(542%) hue-rotate(330deg) brightness(101%) contrast(97%)',
            }}
          />
        </figure>
        
        {/* LEFT SIDE */}
        <Col md={7} className="position-relative z-index-9">
          <h2 className="mb-2 fw-bold">Welcome back{instructorName ? `, ${instructorName}` : ""}!</h2>
          <div className="mt-2">
            <p className="mb-1 text-secondary fs-5">{randomSaying}</p>
          </div>
        </Col>

        <figure className="fill-warning position-absolute bottom-0 start-50 d-none d-xl-block" style={{ zIndex:0 }}>
          <svg width="42px" height="42px">
            <path d="M21.000,-0.001 L28.424,13.575 L41.999,20.999 L28.424,28.424 L21.000,41.998 L13.575,28.424 L-0.000,20.999 L13.575,13.575 L21.000,-0.001 Z" />
          </svg>
        </figure>

        {/* RIGHT SIDE */}
        <Col md={5} className="text-md-end position-relative">
          <figure className="position-absolute top-50 end-0 translate-middle-y me-n8">
            <img src={blob7} />
          </figure>
          <img src={element31} width="450px" className="position-relative" alt="decorative element" />
        </Col>
      </Row>
    </section>
  );
};

export default WelcomeBack;
