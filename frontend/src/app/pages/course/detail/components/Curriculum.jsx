import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner
} from "react-bootstrap";
import clsx from "clsx";
import { Fragment } from "react";
import {
  FaFacebookF,
  FaHeadset,
  FaInstagram,
  FaLinkedinIn,
  FaLock,
  FaPlay,
  FaRegEnvelope,
  FaTwitter,
} from "react-icons/fa";
import { BsPatchCheckFill } from "react-icons/bs";
import element1 from "@/assets/images/element/01.svg";
import { formatCurrency } from "@/utils/currency";
import { secondsToDuration } from "@/utils/duration";
import { useVideoStream } from "@/hooks/useStreamUrl";
import useToggle from "@/hooks/useToggle";
import useCourseDetail from "../useCourseDetail";
import { useNavigate } from "react-router-dom";
import GlightBox from "@/components/GlightBox";


const LecturePlayButton = ({ courseId, lecture, sectionId }) => {
  const { streamUrl, loading } = useVideoStream(courseId, lecture.videoUrl);

  // if video is loading
  if (loading) {
    return (
      <div className="btn-round mb-0 stretched-link position-static flex-centered btn btn-sm btn-light">
        <Spinner animation="border" size="sm" style={{ width: "10px", height: "10px" }} />
      </div>
    );
  }

  // if video is loaded, render the GlightBox
  return (
    <GlightBox
      data-glightbox
      data-gallery={`section-${sectionId}`}
      href={streamUrl}
      className="btn-round mb-0 stretched-link position-static flex-centered btn btn-sm btn-danger-soft"
    >
      <FaPlay className="me-0" size={11} />
    </GlightBox>
  );
};

const Curriculum = ({ coursePrice, premiumAction }) => {
  const { course, loading, error } = useCourseDetail();
  const { isTrue: isOpen, toggle } = useToggle();
  const navigate = useNavigate();

  // UI loading/error
  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-5 text-danger">
        Failed to load course.
      </div>
    );
  if (!course || !Array.isArray(course.curriculum))
    return (
      <div className="text-center py-5 text-muted">
        No curriculum available.
      </div>
    );

  const handlePlay = (lecture) => {
    if (!lecture?.isFree) {
      return toggle();
    }
  };

  return (
    <>
      <Accordion
        defaultActiveKey="0"
        className="accordion-icon accordion-bg-light"
        id="accordionExample2"
      >
        {course.curriculum.map((section, idx) => (
          <AccordionItem
            key={section._id || idx}
            eventKey={`${idx}`}
            className={clsx({ "mb-3": course.curriculum.length - 1 !== idx, })}
          >
            <AccordionHeader as="h6" className="font-base">
              <div className="fw-bold rounded d-sm-flex d-inline-block collapsed">
                {section.section || `Section ${idx + 1}`}
                <span className="small ms-0 ms-sm-2">
                  {(section.lectures || []).length} Lectures
                </span>
              </div>
            </AccordionHeader>

            <AccordionBody className="mt-3">
              {(section.lectures || []).map((lecture, i) => (
                <Fragment key={lecture._id || i}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="position-relative d-flex align-items-center">
                      {lecture.isFree ? (
                        <LecturePlayButton
                          courseId={course._id}
                          lecture={lecture}
                          sectionId={section._id || idx}
                        />
                      ) : (
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-round mb-0 stretched-link position-static flex-centered"
                          onClick={toggle}
                        >
                          <FaPlay className="me-0" size={11} />
                        </Button>
                      )}
                      <Row className="g-sm-0 align-items-center">
                        <Col sm="auto">
                          <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-200px w-md-400px">
                            {lecture.title || "Untitled Lecture"}
                          </span>
                        </Col>
                        {!lecture.isFree && (
                          <Col sm="auto">
                            <span className="badge text-bg-orange ms-2 ms-md-0">
                              <FaLock className="fa-fw me-1" />
                              Premium
                            </span>
                          </Col>
                        )}
                      </Row>
                    </div>

                    <p className="mb-0 small">
                      {(lecture.duration ? `${secondsToDuration(lecture.duration || 0)}` : "--")}
                    </p>
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
        <ModalHeader className="border-0 bg-transparent" closeButton />
        <ModalBody className="px-5 pb-5 position-relative overflow-hidden">
          <figure className="position-absolute bottom-0 end-0 mb-n4 me-n4 d-none d-sm-block">
            <img src={element1} alt="element" />
          </figure>
          <h3>
            Get Course now for the price of
            <span className="h1 ms-1 text-success"> {formatCurrency(coursePrice)}</span>
          </h3>
          <p>
            Unlock full access to all lectures, materials and exclusive
            instructor support.
          </p>

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
              </ul>
            </Col>
            <Col sm={6}>
              <ul className="list-group list-group-borderless">
                <li className="list-group-item text-body">
                  <BsPatchCheckFill className="text-success" />
                  Leveled courses for you
                </li>
                <li className="list-group-item text-body">
                  <BsPatchCheckFill className="text-success" />
                  Over 10+ online courses
                </li>
              </ul>
            </Col>
          </Row>

          <Button variant="orange-soft" size="lg" onClick={premiumAction}>
            Purchase Course
          </Button>
        </ModalBody>
        <ModalFooter className="d-block bg-info">
          <div className="d-sm-flex justify-content-sm-between align-items-center text-center text-sm-start">
            <ul className="list-inline mb-0 social-media-btn mb-2 mb-sm-0">
              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map(
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

export default Curriculum;
