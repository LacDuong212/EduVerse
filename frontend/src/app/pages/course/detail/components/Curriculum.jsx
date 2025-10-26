import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap';
import { curriculumData } from '../data';
import clsx from 'clsx';
import { Fragment } from 'react';
import { FaFacebookF, FaHeadset, FaInstagram, FaLinkedinIn, FaLock, FaPlay, FaRegEnvelope, FaTwitter } from 'react-icons/fa';
import element1 from '@/assets/images/element/01.svg';
import { currency } from '@/context/constants';
import { BsPatchCheckFill } from 'react-icons/bs';
import useToggle from '@/hooks/useToggle';
const Curriculum = () => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  return <>
      <Accordion defaultActiveKey="0" className="accordion-icon accordion-bg-light" id="accordionExample2">
        {curriculumData.map((curriculum, idx) => <AccordionItem key={idx} eventKey={`${idx}`} className={clsx({
        'mb-3': curriculumData.length - 1 != idx
      })}>
            <AccordionHeader as="h6" className="font-base" id="heading-1">
              <div className="fw-bold rounded d-sm-flex d-inline-block collapsed">
                {curriculum.title}
                <span className="small ms-0 ms-sm-2">({curriculum.lectures.length} Lectures)</span>
              </div>
            </AccordionHeader>
            <AccordionBody className="mt-3">
              {curriculum.lectures.map((lecture, idx) => <Fragment key={idx}>
                  <div className="d-flex justify-content-between align-items-center">
                    {lecture.isPremium ? <div className="position-relative d-flex align-items-center">
                        <div>
                          <Button variant="danger-soft" size="sm" className="btn-round mb-0 stretched-link position-static flex-centered" onClick={toggle}>
                            <FaPlay className="me-0" size={11} />
                          </Button>
                        </div>
                        <Row className="g-sm-0 align-items-center">
                          <Col sm={6}>
                            <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-md-400px">{lecture.title}</span>
                          </Col>
                          <Col sm={6}>
                            <span className="badge text-bg-orange ms-2 ms-md-0">
                              <FaLock className="fa-fw me-1" />
                              Premium
                            </span>
                          </Col>
                        </Row>
                      </div> : <div className="position-relative d-flex align-items-center">
                        <Button variant="danger-soft" size="sm" className="btn-round mb-0 stretched-link position-static">
                          <FaPlay className="me-0" size={11} />
                        </Button>
                        <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px w-md-400px">{lecture.title}</span>
                      </div>}
                    <p className={clsx('mb-0', {
                'd-inline-block text-truncate w-70px w-sm-60px': lecture.isPremium
              })}>{lecture.time}</p>
                  </div>
                  {curriculum.lectures.length - 1 != idx && <hr />}
                </Fragment>)}
            </AccordionBody>
          </AccordionItem>)}
      </Accordion>

      <Modal show={isOpen} onHide={toggle} className="fade" size="lg" centered id="exampleModal" tabIndex={-1} aria-hidden="true">
        <ModalHeader className="border-0 bg-transparent" closeButton />
        <ModalBody className="px-5 pb-5 position-relative overflow-hidden">
          <figure className="position-absolute bottom-0 end-0 mb-n4 me-n4 d-none d-sm-block">
            <img src={element1} alt="element" />
          </figure>
          <figure className="position-absolute top-0 end-0 z-index-n1 opacity-2">
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="818.6px" height="235.1px" viewBox="0 0 818.6 235.1">
              <path className="fill-info" d="M735,226.3c-5.7,0.6-11.5,1.1-17.2,1.7c-66.2,6.8-134.7,13.7-192.6-16.6c-34.6-18.1-61.4-47.9-87.3-76.7 c-21.4-23.8-43.6-48.5-70.2-66.7c-53.2-36.4-121.6-44.8-175.1-48c-13.6-0.8-27.5-1.4-40.9-1.9c-46.9-1.9-95.4-3.9-141.2-16.5 C8.3,1.2,6.2,0.6,4.2,0H0c3.3,1,6.6,2,10,3c46,12.5,94.5,14.6,141.5,16.5c13.4,0.6,27.3,1.1,40.8,1.9 c53.4,3.2,121.5,11.5,174.5,47.7c26.5,18.1,48.6,42.7,70,66.5c26,28.9,52.9,58.8,87.7,76.9c58.3,30.5,127,23.5,193.3,16.7 c5.8-0.6,11.5-1.2,17.2-1.7c26.2-2.6,55-4.2,83.5-2.2v-1.2C790,222,761.2,223.7,735,226.3z" />
            </svg>
          </figure>
          <h2>
            Get Premium Course in <span className="text-success">{currency}800</span>
          </h2>
          <p>Prosperous understood Middletons in conviction an uncommonly do. Supposing so be resolving breakfast am or perfectly.</p>
          <Row className="mb-3 item-collapse">
            <Col sm={6}>
              <ul className="list-group list-group-borderless">
                <li className="list-group-item text-body">

                  <BsPatchCheckFill className="text-success" />
                  High quality Curriculum
                </li>
                <li className="list-group-item text-body">

                  <BsPatchCheckFill className="text-success" />
                  Tuition Assistance
                </li>
                <li className="list-group-item text-body">

                  <BsPatchCheckFill className="text-success" />
                  Diploma course
                </li>
              </ul>
            </Col>
            <Col sm={6}>
              <ul className="list-group list-group-borderless">
                <li className="list-group-item text-body">

                  <BsPatchCheckFill className="text-success" />
                  Intermediate courses
                </li>
                <li className="list-group-item text-body">

                  <BsPatchCheckFill className="text-success" />
                  Over 200 online courses
                </li>
              </ul>
            </Col>
          </Row>
          <Button variant="orange-soft" size="lg">
            Purchase premium
          </Button>
        </ModalBody>
        <ModalFooter className="d-block bg-info">
          <div className="d-sm-flex justify-content-sm-between align-items-center text-center text-sm-start">
            <ul className="list-inline mb-0 social-media-btn mb-2 mb-sm-0">
              <li className="list-inline-item">

                <a className="btn btn-white btn-sm shadow px-2 text-facebook" href="#">
                  <FaFacebookF className="fa-fw" />
                </a>
              </li>
              <li className="list-inline-item">

                <a className="btn btn-white btn-sm shadow px-2 text-instagram" href="#">
                  <FaInstagram className="fa-fw" />
                </a>
              </li>
              <li className="list-inline-item">

                <a className="btn btn-white btn-sm shadow px-2 text-twitter" href="#">
                  <FaTwitter className="fa-fw" />
                </a>
              </li>
              <li className="list-inline-item">

                <a className="btn btn-white btn-sm shadow px-2 text-linkedin" href="#">
                  <FaLinkedinIn className="fa-fw" />
                </a>
              </li>
            </ul>
            <div>
              <p className="mb-1 small">
                <a href="#" className="text-white">
                  <FaRegEnvelope className="fa-fw me-2" />
                  example@gmail.com
                </a>
              </p>
              <p className="mb-0 small">
                <a href="#" className="text-white">
                  <FaHeadset className="fa-fw me-2" />
                  123-456-789
                </a>
              </p>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </>;
};
export default Curriculum;
