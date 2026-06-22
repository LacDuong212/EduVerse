import { Fragment } from "react";
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
  Spinner,
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
import useVideoStream from "@/hooks/useVideoStream";
import useToggle from "@/hooks/useToggle";
import { formatCurrency } from "@/utils/currency";
import { secondsToDuration } from "@/utils/duration";

const LecturePlayLink = ({ idx, lecId, title, videoId, duration, isFree, onLocked }) => {
  const { streamUrl, loading, error } = useVideoStream(videoId);

  const lectureName = title || `#${idx + 1}`;

  const content = (
    <>
      <div className="position-relative d-flex align-items-center">
        <span
          className={clsx(
            "btn btn-sm btn-round mb-0 position-static flex-centered me-2",
            {
              "btn-light": !isFree || !videoId || loading,
              "btn-danger": isFree && (error || (!loading && videoId && !streamUrl)),
              "btn-orange-soft": isFree && videoId && streamUrl && !error,
            }
          )}
        >
          {loading && isFree ? (
            <Spinner
              animation="border"
              size="sm"
              style={{ width: "15px", height: "15px" }}
            />
          ) : isFree && (error || !videoId || !streamUrl) ? (
            <MdError size={18} />
          ) : (
            <FaPlay className="me-0" size={14} />
          )}
        </span>

        <span className="d-inline-block text-wrap mb-0 h6 fw-light">
          {title || "Untitled Lecture"}
        </span>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        {!isFree && (
          <span className="badge text-bg-orange me-3">
            <FaLock className="fa-fw me-1" />
            Premium
          </span>
        )}

        <p className="mb-0 small w-80px text-end">
          {duration ? secondsToDuration(duration) : "-m -s"}
        </p>
      </div>
    </>
  );

  if (!isFree) {
    return (
      <button
        type="button"
        className="w-100 border-0 bg-transparent p-0 d-flex justify-content-between align-items-center text-start"
        onClick={onLocked}
      >
        {content}
      </button>
    );
  }

  if (!videoId) {
    return (
      <button
        type="button"
        className="w-100 border-0 bg-transparent p-0 d-flex justify-content-between align-items-center text-start"
        onClick={() => toast.error(`No video found for lecture: ${lectureName}`)}
      >
        {content}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-between align-items-center">
        {content}
      </div>
    );
  }

  if (error || !streamUrl) {
    return (
      <button
        type="button"
        className="w-100 border-0 bg-transparent p-0 d-flex justify-content-between align-items-center text-start"
        onClick={() => toast.error(`Unable to play lecture: ${lectureName}`)}
      >
        {content}
      </button>
    );
  }

  return (
    <GlightBox
      data-glightbox
      data-gallery={`lecture-${lecId || idx}`}
      href={streamUrl}
      className="w-100 d-flex justify-content-between align-items-center text-decoration-none text-body"
    >
      {content}
    </GlightBox>
  );
};

const CurriculumTab = ({ curriculum, price, action }) => {
  const { isTrue: isOpen, toggle } = useToggle();

  if (!curriculum || !Array.isArray(curriculum)) {
    return (
      <div className="text-center py-5 text-muted">
        No curriculum available.
      </div>
    );
  }

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
                  <LecturePlayLink
                    idx={i}
                    lecId={lecture.lecId}
                    title={lecture.title}
                    videoId={lecture.videoId}
                    duration={lecture.duration}
                    isFree={lecture.isFree}
                    onLocked={toggle}
                  />

                  {(section.lectures || []).length - 1 !== i && <hr />}
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
            <span className="h2 border border-3 border-primary rounded bg-primary bg-opacity-10 text-primary ms-2 py-1 px-2">
              {formatCurrency(price)}
            </span>
          </h3>

          <p>Unlock full access to all lectures and materials in this course.</p>

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

          <Button
            variant="orange-soft"
            size="lg"
            className="mb-0"
            onClick={action}
          >
            Purchase Course
          </Button>
        </ModalBody>

        <ModalFooter className="d-block bg-info">
          <div className="d-sm-flex justify-content-sm-between align-items-center text-center text-sm-start">
            <ul className="list-inline mb-0 social-media-btn mb-2 mb-sm-0">
              {[FaFacebookF, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <li className="list-inline-item" key={i}>
                  <a className="btn btn-white btn-sm shadow px-2 mb-0" href="#">
                    <Icon className="fa-fw" />
                  </a>
                </li>
              ))}
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