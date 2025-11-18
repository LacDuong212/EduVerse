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
import { formatCurrency } from '@/utils/currency';
import useToggle from "@/hooks/useToggle";
import useCourseDetail from "../useCourseDetail"; // 🔗 hook bạn cung cấp
import { useNavigate } from "react-router-dom";
// 🔥 thêm GlightBox
import GlightBox from "@/components/GlightBox";

const Curriculum = ({ coursePrice }) => {
  const { course, loading, error } = useCourseDetail(); // ✅ lấy dữ liệu thật
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

  // 🔥 handlePlay giờ chỉ xử lý lecture PREMIUM (không free)
  const handlePlay = (lecture) => {
    if (!lecture?.isFree) {
      return toggle(); // Premium → mở modal
    }
    // lecture free sẽ dùng GlightBox, KHÔNG navigate nữa
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
            className={clsx({
              "mb-3": course.curriculum.length - 1 !== idx,
            })}
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
                      {/* 🔥 FREE: dùng GlightBox; PREMIUM: dùng Button + handlePlay */}
                      {lecture.isFree && lecture.videoUrl ? (
                        <GlightBox
                          data-glightbox
                          data-gallery={`section-${section._id || idx}`}
                          href={lecture.videoUrl}
                          className="btn-round mb-0 stretched-link position-static flex-centered btn btn-sm btn-danger-soft"
                        >
                          <FaPlay className="me-0" size={11} />
                        </GlightBox>
                      ) : (
                        <Button
                          variant={lecture.isFree ? "danger-soft" : "light"}
                          size="sm"
                          className="btn-round mb-0 stretched-link position-static flex-centered"
                          onClick={() => handlePlay(lecture)}
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

                    <p className="mb-0 small text-muted">
                      {lecture.time ||
                        (lecture.duration ? `${lecture.duration}m` : "--")}
                    </p>
                  </div>

                  {section.lectures.length - 1 !== i && <hr />}
                </Fragment>
              ))}
            </AccordionBody>
          </AccordionItem>
        ))}
      </Accordion>

      {/* 💎 Premium Modal giữ nguyên */}
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
          <figure className="position-absolute top-0 end-0 z-index-n1 opacity-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="818.6px"
              height="235.1px"
              viewBox="0 0 818.6 235.1"
            >
              <path
                className="fill-info"
                d="M735,226.3c-5.7,0.6-11.5,1.1-17.2,1.7c-66.2,6.8-134.7,13.7-192.6-16.6..."
              />
            </svg>
          </figure>
          <h2>
            Get Premium Course in{" "}
            <span className="text-success">{formatCurrency(coursePrice)}</span>
          </h2>
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
              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map(
                (Icon, i) => (
                  <li className="list-inline-item" key={i}>
                    <a className="btn btn-white btn-sm shadow px-2" href="#">
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
    </>
  );
};

export default Curriculum;
