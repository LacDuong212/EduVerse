import { Fragment } from "react";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Spinner,
} from "react-bootstrap";
import clsx from "clsx";
import { FaPlay } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { toast } from "react-toastify";
import GlightBox from "@/components/GlightBox";
import useVideoStream from "@/hooks/useVideoStream";
import { secondsToDuration } from "@/utils/duration";

const LecturePlayButton = ({ idx, lecId, title, videoId }) => {
  const { streamUrl, loading, error } = useVideoStream(videoId);

  const lectureName = title || `#${idx + 1}`;

  if (!videoId) {
    return (
      <Button
        variant="light"
        size="sm"
        className="btn-round mb-0 position-static flex-centered"
        onClick={() => toast.error(`No video found for lecture: ${lectureName}`)}
      >
        <MdError size={18} />
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="btn btn-sm btn-round btn-light mb-0 position-static flex-centered">
        <Spinner
          animation="border"
          size="sm"
          style={{ width: "15px", height: "15px" }}
        />
      </div>
    );
  }

  if (error || !streamUrl) {
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

const CurriculumTab = ({ curriculum }) => {
  if (!curriculum || !Array.isArray(curriculum) || curriculum.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        No curriculum available.
      </div>
    );
  }

  return (
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
                    <LecturePlayButton
                      idx={i}
                      lecId={lecture.lecId}
                      title={lecture.title}
                      videoId={lecture.videoId}
                    />

                    <span className="d-inline-block text-wrap ms-2 mb-0 h6 fw-light">
                      {lecture.title || "Untitled Lecture"}
                    </span>
                  </div>

                  <p className="mb-0 small w-80px text-end">
                    {lecture.duration
                      ? secondsToDuration(lecture.duration)
                      : "-m -s"}
                  </p>
                </div>

                {(section.lectures || []).length - 1 !== i && <hr />}
              </Fragment>
            ))}
          </AccordionBody>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default CurriculumTab;