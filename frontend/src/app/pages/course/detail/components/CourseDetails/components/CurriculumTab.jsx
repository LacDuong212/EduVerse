import { Fragment } from "react";
import {
  Accordion, AccordionBody, AccordionHeader, AccordionItem,
  Button,
  Col,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Row,
  Spinner
} from "react-bootstrap";
import clsx from "clsx";
import { BsPatchCheckFill } from "react-icons/bs";
import {
  FaFacebookF,
  FaHeadset,
  FaInstagram,
  FaLinkedinIn,
  FaLock,
  FaPlay,
  FaRegEnvelope,
} from "react-icons/fa";
import { MdError } from "react-icons/md";
import { toast } from "react-toastify";
import element1 from "@/assets/images/element/01.svg";
import GlightBox from "@/components/GlightBox";
import { useVideoStream } from "@/hooks/useStreamUrl";
import useToggle from "@/hooks/useToggle";
import { formatCurrency } from "@/utils/currency";
import { secondsToDuration } from "@/utils/duration";

const LecturePlayButton = ({ idx, lecId, title, videoId }) => {
  const { streamUrl, loading, error } = useVideoStream(videoId);

  if (loading) {
    return (
      <div className="btn btn-sm btn-round btn-light mb-0 position-static flex-centered">
        <Spinner animation="border" size="sm" style={{ width: "15px", height: "15px" }} />
      </div>
    );
  }

  const lectureName = title || `#${idx + 1}`;

  if (error) {
    return (
      <Button
        variant="danger"
        size="sm"
        className="btn-round mb-0 position-static flex-centered"
        onClick={() => toast.error(`Unable to play lecture: ${lectureName}`)}
      >
        <MdError size={18} />
      </Button>
    );
  }

  return (
    <GlightBox
      data-glightbox
      data-gallery={`lecture-${lecId || idx}`}
      href={streamUrl}
      className="btn btn-sm btn-round btn-orange-soft mb-0 position-static flex-centered"
    >
      <FaPlay className="me-0" size={14} />
    </GlightBox>
  );
};

const CurriculumTab = ({ curriculum, price, action }) => {
  const { isTrue: isOpen, toggle } = useToggle();

  if (!curriculum || !Array.isArray(curriculum))
    return (
      <div className="text-center py-5 text-muted">
        No curriculum available.
      </div>
    );

  return (
    <>
      <Accordion
        defaultActiveKey="0"
        className="accordion-icon accordion-bg-light"
        id="accordionExample2"
      >
        {curriculum.map((section, idx) => (
          <AccordionItem
            key={section.secId || idx}
            eventKey={`${idx}`}
            className={clsx({ "mb-3": curriculum.length - 1 !== idx })}
          >
            <AccordionHeader as="h6" className="font-base">
              <div className="fw-bold rounded d-sm-flex d-inline-block collapsed">
                {section.title || `Section ${idx + 1}`}
                <span className="small fw-light ms-1">
                  ({(section.lectures || []).length} lectures)
                </span>
              </div>
            </AccordionHeader>

            <AccordionBody className="mt-3">
              {(section.lectures || []).map((lecture, i) => (
                <Fragment key={lecture.lecId || i}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="position-relative d-flex align-items-center">
                      {lecture.isFree ? (
                        <LecturePlayButton
                          idx={i}
                          lecId={lecture.lecId}
                          title={lecture.title}
                          videoId={lecture.videoId}
                        />
                      ) : (
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-round mb-0 position-static"
                          onClick={toggle}
                        >
                          <FaPlay className="me-0" size={14} />
                        </Button>
                      )}
                      <span className="d-inline-block text-wrap ms-2 mb-0 h6 fw-light">
                        {lecture.title || "Untitled Lecture"}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      {!lecture.isFree && (
                        <span className="badge text-bg-orange">
                          <FaLock className="fa-fw me-1" />
                          Premium
                        </span>
                      )}
                      <p className="mb-0 small w-80px text-end">
                        {(lecture.duration ? `${secondsToDuration(lecture.duration || 0)}` : "-m -s")}
                      </p>
                    </div>
                  </div>

                  {section.lectures.length - 1 !== i && <hr />}
                </Fragment>
              ))}
            </AccordionBody>
          </AccordionItem>
        ))}
      </Accordion>

      <Modal
        show={isOpen}
        onHide={toggle}
        className="fade"
        size="lg"
        centered
        id="exampleModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ModalHeader className="border-0 bg-warning" closeButton />
        <ModalBody className="px-5 pb-5 position-relative overflow-hidden">
          <figure className="position-absolute bottom-0 end-0 mb-n4 me-n4 d-none d-sm-block">
            <img src={element1} alt="element" />
          </figure>
          <h3 className="d-flex align-items-center">
            Get course NOW for the PRICE of
            <span className="h2 border border-3 border-primary rounded bg-primary bg-opacity-10 text-primary ms-2 py-1 px-2">{formatCurrency(price)}</span>
          </h3>
          <p>
            Unlock full access to all lectures and materials in this course.
          </p>

          <Row className="mb-3 item-collapse">
            <Col sm={6}>
              <ul className="list-group list-group-borderless">
                <li className="list-group-item text-body">
                  <BsPatchCheckFill className="text-success me-1" />
                  Full Curriculum
                </li>
                <li className="list-group-item text-body">
                  <BsPatchCheckFill className="text-success me-1" />
                  Lecture Summary and Key Concepts
                </li>
              </ul>
            </Col>
            <Col sm={6}>
              <ul className="list-group list-group-borderless">
                <li className="list-group-item text-body">
                  <BsPatchCheckFill className="text-success me-1" />
                  Quizzes
                </li>
                <li className="list-group-item text-body">
                  <BsPatchCheckFill className="text-success me-1" />
                  Final evaluation
                </li>
              </ul>
            </Col>
          </Row>

          <Button variant="orange-soft" size="lg" className="mb-0" onClick={action}>
            Purchase Course
          </Button>
        </ModalBody>
        <ModalFooter className="d-block bg-info">
          <div className="d-sm-flex justify-content-sm-between align-items-center text-center text-sm-start">
            <ul className="list-inline mb-0 social-media-btn mb-2 mb-sm-0">
              {[FaFacebookF, FaInstagram, FaLinkedinIn].map(
                (Icon, i) => (
                  <li className="list-inline-item" key={i}>
                    <a className="btn btn-white btn-sm shadow px-2 mb-0" href="#">
                      <Icon className="fa-fw" />
                    </a>
                  </li>
                )
              )}
            </ul>
            <div>
              <p className="mb-1 small">
                <a href="#" className="text-white">
                  <FaRegEnvelope className="fa-fw me-2" />
                  example@d2v-team.com
                </a>
              </p>
              <p className="mb-0 small">
                <a href="#" className="text-white">
                  <FaHeadset className="fa-fw me-2" />
                  0111-222-333
                </a>
              </p>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CurriculumTab;