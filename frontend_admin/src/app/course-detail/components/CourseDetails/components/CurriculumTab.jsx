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

const LecturePlayLink = ({ idx, lecId, title, videoId, duration }) => {
  const { streamUrl, loading, error } = useVideoStream(videoId);

  const lectureName = title || `#${idx + 1}`;

  const content = (
    <>
      <div className="position-relative d-flex align-items-center">
        <span
          className={clsx(
            "btn btn-sm btn-round mb-0 position-static flex-centered me-2",
            {
              "btn-light": !videoId || loading,
              "btn-danger": error || (!loading && videoId && !streamUrl),
              "btn-orange-soft": videoId && streamUrl && !error,
            }
          )}
        >
          {loading ? (
            <Spinner
              animation="border"
              size="sm"
              style={{ width: "15px", height: "15px" }}
            />
          ) : error || !videoId || !streamUrl ? (
            <MdError size={18} />
          ) : (
            <FaPlay className="me-0" size={14} />
          )}
        </span>

        <span className="d-inline-block text-wrap mb-0 h6 fw-light">
          {title || "Untitled Lecture"}
        </span>
      </div>

      <p className="mb-0 small w-80px text-end">
        {duration ? secondsToDuration(duration) : "-m -s"}
      </p>
    </>
  );

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
                <LecturePlayLink
                  idx={i}
                  lecId={lecture.lecId}
                  title={lecture.title}
                  videoId={lecture.videoId}
                  duration={lecture.duration}
                />

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