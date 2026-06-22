import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "react-bootstrap";
import { Fragment, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaLock, FaPlay } from "react-icons/fa";
import { BsCheckCircleFill, BsChatSquareText } from "react-icons/bs";
import course1 from "@/assets/images/courses/4by3/01.jpg";
import { secondsToDuration } from "@/utils/duration";
import QnaModal from "./QnaModal";

const CourseMaterial = ({ curriculum = [], lectureTracking = {} }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [qnaModal, setQnaModal] = useState(null); // { lectureId, lectureTitle }

  const unlockedSectionIndex = useMemo(() => {
    if (!curriculum.length) return 0;

    let unlocked = 0;
    let canContinue = true;

    for (let index = 0; index < curriculum.length; index++) {
      if (!canContinue) break;

      const lectures = curriculum[index]?.lectures || [];
      const requiredCount = Math.min(3, lectures.length);

      const completedCount = lectures.filter(
        (lecture) => lectureTracking?.[lecture.lecId]?.status === "completed"
      ).length;

      unlocked = index;

      if (completedCount < requiredCount) {
        canContinue = false;
      }
    }

    return unlocked;
  }, [curriculum, lectureTracking]);

  const openQna = (lectureId, lectureTitle, e) => {
    e.stopPropagation();
    setQnaModal({ lectureId, lectureTitle });
  };

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

  const renderLectureStatus = (lecture, isLocked) => {
    if (isLocked) {
      return (
        <span className="ms-2 flex-shrink-0 text-secondary">
          <FaLock size={16} />
        </span>
      );
    }

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
      <p className="text-body mb-0">
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
      {qnaModal && (
        <QnaModal
          show={!!qnaModal}
          onHide={() => setQnaModal(null)}
          lectureId={qnaModal.lectureId}
          lectureTitle={qnaModal.lectureTitle}
        />
      )}

      {curriculum.map((section, sIdx) => {
        const isSectionLocked = sIdx > unlockedSectionIndex;
        const lectures = section.lectures || [];
        const limitByThree = lectures.length > 3;

        return (
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
                    ({lectures.length} lectures)
                  </span>
                  {isSectionLocked && (
                    <FaLock size={13} className="ms-2 text-secondary" />
                  )}
                </div>

                {!isSectionLocked && renderSectionStatus(section)}
              </div>
            </AccordionHeader>

            <AccordionBody className="mt-3">
              {lectures.map((lecture, lIdx) => {
                const isQuotaLocked = limitByThree && lIdx >= 3;
                const isLocked = isSectionLocked || isQuotaLocked;

                return (
                  <Fragment key={lecture.lecId || lIdx}>
                    <div
                      className="d-flex justify-content-between align-items-center py-2 px-1"
                      style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                      onClick={() => {
                        if (!isLocked) goToWatch(lecture.lecId);
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="icon-md position-relative"
                          style={{ opacity: isLocked ? 0.5 : 1 }}
                        >
                          <img
                            src={course1}
                            className="rounded-1"
                            alt="lecture thumbnail"
                          />
                          <small className="text-white position-absolute top-50 start-50 translate-middle">
                            {isLocked ? (
                              <FaLock className="me-0" size={12} />
                            ) : (
                              <FaPlay className="me-0" />
                            )}
                          </small>
                        </div>

                        <div className="ms-3">
                          <span
                            className={`d-inline-block text-truncate mb-0 h6 fw-normal w-100px w-sm-200px w-md-400px ${isLocked ? "text-secondary" : ""}`}
                          >
                            {lecture.title || "Untitled lecture"}
                          </span>

                          <ul className="nav nav-divider small mb-0">
                            <li className="nav-item">Video</li>

                            {lecture.duration != null && (
                              <li className="nav-item">
                                {secondsToDuration(lecture.duration)}
                              </li>
                            )}

                            {lecture.isFree && !isLocked && (
                              <li className="nav-item text-success">Preview</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {!isLocked && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            onClick={(e) =>
                              openQna(lecture.lecId, lecture.title, e)
                            }
                            title="View Q&A for this lecture"
                          >
                            <BsChatSquareText size={13} />
                            Q&amp;A
                          </button>
                        )}
                        {renderLectureStatus(lecture, isLocked)}
                      </div>
                    </div>

                    {lectures.length - 1 !== lIdx && <hr />}
                  </Fragment>
                );
              })}
            </AccordionBody>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CourseMaterial;