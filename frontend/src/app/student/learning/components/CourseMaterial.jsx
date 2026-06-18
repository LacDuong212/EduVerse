import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "react-bootstrap";
import { Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import course1 from "@/assets/images/courses/4by3/01.jpg";
import { secondsToDuration } from "@/utils/duration";

const CourseMaterial = ({ curriculum = [], lectureTracking = {} }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const goToWatch = (lectureId) => {
    if (!courseId || !lectureId) return;
    navigate(`/student/courses/${courseId}/watch/${lectureId}`);
  };

  const getLectureState = (lecture) => {
    const lectureId = lecture.lecId;
    const info = lectureTracking?.[lectureId] || {};
    const rawStatus = (info.status || "").toLowerCase();

    const status =
      rawStatus === "completed"
        ? "completed"
        : rawStatus === "in-progress" || rawStatus === "in_progress"
          ? "in-progress"
          : "not-started";

    const progress =
      typeof info.progress === "number"
        ? Math.min(Math.max(info.progress, 0), 100)
        : 0;

    return { status, progress };
  };

  const renderLectureStatus = (lecture) => {
    const { status, progress } = getLectureState(lecture);

    if (status === "completed") {
      return (
        <BsCheckCircleFill
          className="text-success ms-2 flex-shrink-0"
          size={20}
        />
      );
    }

    if (status === "in-progress") {
      return (
        <div
          className="rounded-circle border border-primary text-primary d-flex align-items-center justify-content-center ms-2 flex-shrink-0"
          style={{ width: 32, height: 32, fontSize: "0.75rem" }}
        >
          {Math.round(progress)}%
        </div>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-sm btn-outline-primary ms-2 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          goToWatch(lecture.lecId);
        }}
      >
        Start
      </button>
    );
  };

  const getSectionState = (section) => {
    const lectures = section.lectures || [];

    if (!lectures.length) {
      return { status: "not-started" };
    }

    const states = lectures.map(getLectureState);
    const total = lectures.length;
    const completedCount = states.filter((s) => s.status === "completed").length;
    const hasInProgress = states.some((s) => s.status === "in-progress");

    if (completedCount === total) {
      return { status: "completed" };
    }

    if (completedCount > 0 || hasInProgress) {
      return { status: "in-progress" };
    }

    return { status: "not-started" };
  };

  const renderSectionStatus = (section) => {
    const { status } = getSectionState(section);

    if (status === "completed") {
      return <span className="badge bg-success ms-2 flex-shrink-0">Done</span>;
    }

    if (status === "in-progress") {
      return (
        <span className="badge bg-primary ms-2 flex-shrink-0">
          In Progress
        </span>
      );
    }

    return (
      <span className="badge bg-secondary ms-2 flex-shrink-0">
        Not Started
      </span>
    );
  };

  if (!Array.isArray(curriculum) || curriculum.length === 0) {
    return (
      <p className="text-muted mb-0">
        This course does not have any published curriculum yet.
      </p>
    );
  }

  return (
    <Accordion
      defaultActiveKey="0"
      className="accordion-icon accordion-border"
      id="course-material-accordion"
    >
      {curriculum.map((section, sIdx) => (
        <AccordionItem
          eventKey={`${sIdx}`}
          className="mb-3"
          key={section.secId || sIdx}
        >
          <AccordionHeader as="h6" className="font-base">
            <div className="fw-bold rounded d-flex w-100 align-items-center justify-content-between pe-4">
              <div className="d-flex align-items-center">
                <span className="me-2">Section {sIdx + 1} -</span>
                <span className="small">{section.title}</span>
                <span className="small ms-2 d-none d-sm-block">
                  ({section.lectures?.length || 0} lectures)
                </span>
              </div>

              {renderSectionStatus(section)}
            </div>
          </AccordionHeader>

          <AccordionBody className="mt-3">
            {(section.lectures || []).map((lecture, lIdx) => (
              <Fragment key={lecture.lecId || lIdx}>
                <div
                  className="d-flex justify-content-between align-items-center py-2 px-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => goToWatch(lecture.lecId)}
                >
                  <div className="d-flex align-items-center">
                    <div className="icon-md position-relative">
                      <img
                        src={course1}
                        className="rounded-1"
                        alt="lecture thumbnail"
                      />
                      <small className="text-white position-absolute top-50 start-50 translate-middle">
                        <FaPlay className="me-0" />
                      </small>
                    </div>

                    <div className="ms-3">
                      <span className="d-inline-block text-truncate mb-0 h6 fw-normal w-100px w-sm-200px w-md-400px">
                        {lecture.title || "Untitled lecture"}
                      </span>

                      <ul className="nav nav-divider small mb-0">
                        <li className="nav-item">Video</li>

                        {lecture.duration != null && (
                          <li className="nav-item">
                            {secondsToDuration(lecture.duration)}
                          </li>
                        )}

                        {lecture.isFree && (
                          <li className="nav-item text-success">Preview</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {renderLectureStatus(lecture)}
                </div>

                {(section.lectures?.length || 0) - 1 !== lIdx && <hr />}
              </Fragment>
            ))}
          </AccordionBody>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default CourseMaterial;