import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Accordion, AccordionBody, AccordionHeader, AccordionItem,
  Button,
  Card, CardBody, CardFooter, CardHeader,
  Col
} from "react-bootstrap";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaLock, FaPlay } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import QnaModal from "@/app/student/learning/components/QnaModal";

export default function Playlist({
  course,
  onSelect,
  currentId,
  lectureProgress = {},
}) {
  const navigate = useNavigate();
  const [showQna, setShowQna] = useState(false);

  const sections = useMemo(() => {
    return course?.curriculum?.sections || [];
  }, [course]);

  const currentLectureTitle = useMemo(() => {
    for (const sec of sections) {
      const found = (sec.lectures || []).find((l) => l.lecId === currentId);
      if (found) return found.title;
    }
    return null;
  }, [sections, currentId]);

  const sectionKeys = useMemo(() => {
    return sections.map((section, index) => String(section.secId || index));
  }, [sections]);

  const findSectionKeyByLectureId = (lecId) => {
    if (!lecId) return sectionKeys[0] || "0";

    for (let i = 0; i < sections.length; i++) {
      const lectures = sections[i]?.lectures || [];

      if (lectures.some((lecture) => lecture.lecId === lecId)) {
        return String(sections[i].secId || i);
      }
    }

    return sectionKeys[0] || "0";
  };

  const [activeKey, setActiveKey] = useState(() =>
    findSectionKeyByLectureId(currentId)
  );

  useEffect(() => {
    setActiveKey(findSectionKeyByLectureId(currentId));
  }, [currentId, sections.length]);

  const unlockedSectionIndex = useMemo(() => {
    if (!sections.length) return 0;

    let unlocked = 0;
    let canContinue = true;

    for (let index = 0; index < sections.length; index++) {
      if (!canContinue) break;

      const lectures = sections[index]?.lectures || [];
      const requiredCount = Math.min(3, lectures.length);

      const completedCount = lectures.filter((lecture) => {
        return lectureProgress?.[lecture.lecId]?.status === "completed";
      }).length;

      unlocked = index;

      if (completedCount < requiredCount) {
        canContinue = false;
      }
    }

    return unlocked;
  }, [sections, lectureProgress]);

  const formatDuration = (seconds) => {
    const total = Number(seconds);

    if (!Number.isFinite(total) || total <= 0) return "--";

    const minutes = Math.floor(total / 60);
    const remainSeconds = Math.floor(total % 60);

    return `${minutes}m ${remainSeconds}s`;
  };

  const getProgressPercent = (lecture) => {
    const progress = lectureProgress?.[lecture.lecId] || {};
    const status = progress.status || "not_started";

    if (status === "completed") return 100;

    const lastPositionSec =
      typeof progress.lastPositionSec === "number"
        ? progress.lastPositionSec
        : 0;

    const durationSec =
      typeof progress.durationSec === "number" && progress.durationSec > 0
        ? progress.durationSec
        : lecture.duration;

    if (durationSec > 0 && lastPositionSec > 0) {
      return Math.min(
        100,
        Math.max(0, Math.round((lastPositionSec / durationSec) * 100))
      );
    }

    return 0;
  };

  const handlePlay = (lecture) => {
    if (!lecture?.lecId) return;

    if (typeof onSelect === "function") {
      onSelect(lecture);
      return;
    }

    navigate(`/student/courses/${course?.courseId}/watch/${lecture.lecId}`);
  };

  return (
    <Card className="d-flex flex-column h-100 overflow-hidden rounded-0 w-100">
      <CardHeader className="bg-light rounded-0 flex-shrink-0">
        <h1 className="fs-5">{course?.title || "Course"}</h1>

        {course?.instructor?.name && (
          <h6 className="mb-0 fw-normal">By {course.instructor.name}</h6>
        )}
      </CardHeader>

      <CardBody className="flex-grow-1 overflow-auto p-2">
        <Col xs={12} className="px-0">
          <Accordion
            activeKey={activeKey}
            onSelect={(eventKey) => setActiveKey(eventKey)}
            flush
            className="accordion-flush-light"
          >
            {sections.map((section, sectionIndex) => {
              const eventKey = String(section.secId || sectionIndex);
              const lectures = section.lectures || [];

              const limitByThree = lectures.length > 3;
              const isFutureSectionLocked =
                sectionIndex > unlockedSectionIndex;

              const sectionCompleted =
                lectures.length > 0 &&
                lectures.every(
                  (lecture) =>
                    lectureProgress?.[lecture.lecId]?.status === "completed"
                );

              return (
                <AccordionItem eventKey={eventKey} key={eventKey}>
                  <AccordionHeader>
                    <span className="mb-0 fw-bold d-inline-flex align-items-center justify-content-between w-100">
                      {section.title || `Section ${sectionIndex + 1}`}

                      {isFutureSectionLocked && " 🔒"}

                      {sectionCompleted && !isFutureSectionLocked && (
                        <BsCheckCircleFill
                          size={14}
                          className="text-success mx-1 flex-shrink-0"
                          title="Section completed"
                        />
                      )}
                    </span>
                  </AccordionHeader>

                  <AccordionBody className="px-3">
                    <div className="vstack gap-2">
                      {lectures.map((lecture, lectureIndex) => {
                        const isQuotaLocked =
                          limitByThree && lectureIndex >= 3;
                        const isLocked =
                          isFutureSectionLocked || isQuotaLocked;

                        const isActive = currentId === lecture.lecId;
                        const progress = lectureProgress?.[lecture.lecId] || {};
                        const status = progress.status || "not_started";

                        const isCompleted = status === "completed";
                        const isInProgress =
                          status === "in_progress" ||
                          status === "in-progress";

                        const progressPercent = getProgressPercent(lecture);

                        const timeLabel =
                          typeof lecture.duration === "number"
                            ? formatDuration(lecture.duration)
                            : "--";

                        let buttonVariant = "primary";
                        let buttonContent = (
                          <FaPlay className="me-0" size={13} />
                        );

                        if (isLocked) {
                          buttonVariant = "light";
                          buttonContent = <FaLock size={13} />;
                        } else if (isCompleted) {
                          buttonVariant = "success";
                          buttonContent = <BsCheckCircleFill size={13} />;
                        } else if (isInProgress) {
                          buttonVariant = "outline-primary";
                          buttonContent = (
                            <span className="small fw-bold">
                              {progressPercent}%
                            </span>
                          );
                        }

                        let titleColorClass = "";

                        if (isCompleted) {
                          titleColorClass = "text-success";
                        } else if (isInProgress) {
                          titleColorClass = "text-primary";
                        } else if (isActive) {
                          titleColorClass = "text-danger";
                        }

                        return (
                          <Fragment key={lecture.lecId || lectureIndex}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="position-relative d-flex align-items-center">
                                <Button
                                  variant={buttonVariant}
                                  size="sm"
                                  className="btn-round mb-0 stretched-link position-static"
                                  onClick={() => {
                                    if (!isLocked) handlePlay(lecture);
                                  }}
                                  disabled={isLocked}
                                  title={lecture.title}
                                >
                                  {buttonContent}
                                </Button>

                                <span
                                  className={`d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px ${titleColorClass}`}
                                  title={lecture.title}
                                >
                                  {lecture.title || "Untitled"}
                                </span>
                              </div>

                              <p className="mb-0 text-truncate">
                                {timeLabel}
                              </p>
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>
                  </AccordionBody>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Col>
      </CardBody>

      <CardFooter className="flex-shrink-0">
        <div className="d-grid gap-2">
          <Button
            variant="outline-primary"
            className="mb-0"
            onClick={() => setShowQna(true)}
          >
            Q&amp;A
          </Button>
          <Link
            to={`/student/courses/${course?.courseId || ""}`}
            className="btn btn-primary-soft mb-0"
          >
            Back to Learning Course
          </Link>
        </div>
      </CardFooter>

      {showQna && (
        <QnaModal
          show={showQna}
          onHide={() => setShowQna(false)}
          lectureId={currentId}
          lectureTitle={currentLectureTitle}
        />
      )}
    </Card>
  );
}