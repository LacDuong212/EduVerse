// components/Playlist.jsx
import TextFormInput from '@/components/form/TextFormInput';
import useToggle from '@/hooks/useToggle';
import { Link, useNavigate } from 'react-router-dom';
import { Fragment, useMemo, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Collapse,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { BsLockFill, BsPencilSquare, BsPlayFill, BsTrashFill, BsCheckCircleFill } from 'react-icons/bs';
import { FaPlay } from 'react-icons/fa';
import * as yup from 'yup';

/**
 * Props:
 * - course: object từ API getCourseById (bắt buộc)
 * - onSelect?: (lecture) => void  // callback khi chọn bài (nếu không truyền sẽ navigate theo route)
 * - currentId?: string            // _id lecture đang phát để active UI
 * - lectureProgress?: { [lectureId]: { status, lastPositionSec, durationSec, percentage?, currentTimeSec?, positionSec? } }
 */
const Playlist = ({ course, onSelect, currentId, lectureProgress = {} }) => {
  const navigate = useNavigate();

  const { isTrue: isOpenAddNote, toggle: toggleAddNote } = useToggle();
  const { isTrue: isOpenInlineNote, toggle: toggleInlineNote } = useToggle();

  // Chuẩn hóa dữ liệu từ course.curriculum
  const sections = useMemo(
    () => (Array.isArray(course?.curriculum) ? course.curriculum : []),
    [course]
  );

  // -------- quản lý active section theo currentId (controlled Accordion) ----------
  const sectionKeys = useMemo(
    () => sections.map((sec, idx) => String(sec?._id ?? idx)),
    [sections]
  );

  const findSectionKeyByLectureId = (lecId) => {
    if (!lecId) return sectionKeys[0] ?? '0';
    for (let i = 0; i < sections.length; i++) {
      const lecs = Array.isArray(sections[i]?.lectures) ? sections[i].lectures : [];
      if (lecs.some((l) => l?._id === lecId)) {
        return String(sections[i]?._id ?? i);
      }
    }
    return sectionKeys[0] ?? '0';
  };

  const [activeKey, setActiveKey] = useState(() => findSectionKeyByLectureId(currentId));

  useEffect(() => {
    setActiveKey(findSectionKeyByLectureId(currentId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, sections.length]);
  // ------------------------------------------------------------------------------------

  // 🔐 xác định "section đang mở được" theo rule:
  // - Nếu section có >3 lecture: cần completed >= 3 để mở section tiếp theo
  // - Nếu section có <=3 lecture: cần completed = số lecture trong section
  const unlockedSectionIndex = useMemo(() => {
    if (!Array.isArray(sections) || sections.length === 0) return 0;

    let unlocked = 0;
    let allPreviousFinished = true;

    for (let idx = 0; idx < sections.length; idx++) {
      if (!allPreviousFinished) break;

      const sec = sections[idx];
      const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];

      const totalLectures = lecs.length;
      const limit = Math.min(3, totalLectures);

      let completedCount = 0;
      lecs.forEach((lecture) => {
        const id = lecture?._id;
        if (!id) return;
        const lecProg =
          lectureProgress?.[id] ||
          lectureProgress?.[id?.toString?.()] ||
          null;

        if (lecProg?.status === 'completed') {
          completedCount += 1;
        }
      });

      unlocked = idx;

      if (completedCount < limit) {
        allPreviousFinished = false;
      }
    }

    return unlocked;
  }, [sections, lectureProgress]);

  // Schema note
  const noteSchema = yup.object({
    note: yup.string().required('please enter your note'),
  });
  const { control, handleSubmit } = useForm({ resolver: yupResolver(noteSchema) });

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '--';

    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;

    return `${minutes}m ${seconds}s`;
  };

  const PlayNote = () => (
    <>
      <Button
        onClick={toggleInlineNote}
        variant="warning"
        className="btn btn-xs"
        role="button"
        aria-expanded={isOpenInlineNote}
        aria-controls="addnote-1"
      >
        View note
      </Button>
      <Collapse in={isOpenInlineNote}>
        <div>
          <Card className="card-body p-0">
            <div className="d-flex justify-content-between bg-light rounded-2 p-2 mb-2">
              <div className="d-flex align-items-center">
                <span className="badge bg-dark me-2">5:20</span>
                <h6 className="d-inline-block text-truncate w-40px w-sm-150px mb-0 fw-light">
                  Describe SEO Engine
                </h6>
              </div>
              <div className="d-flex">
                <Button variant="light" size="sm" className="btn-round me-2 mb-0">
                  <BsPlayFill className="fa-fw" />
                </Button>
                <Button variant="light" size="sm" className="btn-round mb-0">
                  <BsTrashFill className="fa-fw" />
                </Button>
              </div>
            </div>
            <div className="d-flex justify-content-between bg-light rounded-2 p-2 mb-2">
              <div className="d-flex align-items-center">
                <span className="badge bg-dark me-2">10:20</span>
                <h6 className="d-inline-block text-truncate w-40px w-sm-150px mb-0 fw-light">
                  Know about all marketing
                </h6>
              </div>
              <div className="d-flex">
                <Button variant="light" size="sm" className="btn-round me-2 mb-0">
                  <BsPlayFill className="fa-fw" />
                </Button>
                <Button variant="light" size="sm" className="btn-round mb-0">
                  <BsTrashFill className="bi fa-fw bi-trash-fill" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Collapse>
    </>
  );

  // Handler chọn bài
  const handlePlay = (lecture) => {
    if (!lecture) return;
    if (typeof onSelect === 'function') onSelect(lecture);
    else navigate(`/courses/${course._id}/watch/${lecture._id}`);
  };

  return (
    <>
      <Card className="vh-100 overflow-auto rounded-0 w-280px w-sm-400px">
        <CardHeader className="bg-light rounded-0">
          <h1 className="mt-2 fs-5">{course?.title || 'Course'}</h1>
          {course?.instructor?.ref && (
            <h6 className="mb-0 fw-normal">
              <a href="#">By Instructor</a>
            </h6>
          )}
        </CardHeader>

        <CardBody>
          <div className="d-sm-flex justify-content-sm-between">
            <h5>Course content</h5>
            <Button variant="warning" size="sm" type="button" onClick={toggleAddNote}>
              <BsPencilSquare className="fa-fw me-2" />
              Add note
            </Button>
          </div>
          <hr />

          <Row>
            <Col xs={12}>
              <Accordion
                activeKey={activeKey}
                onSelect={(ek) => setActiveKey(ek)}
                flush
                className="accordion-flush-light"
                id="accordionExample"
              >
                {sections.map((sec, sIdx) => {
                  const ek = String(sec?._id ?? sIdx);
                  const lecturesInSection = Array.isArray(sec?.lectures) ? sec.lectures : [];

                  const limitByThree = lecturesInSection.length > 3;
                  const isFutureSectionLocked = sIdx > unlockedSectionIndex;

                  // ✅ NEW: tính trạng thái completed cho SECTION
                  const nonNoteLectures = lecturesInSection.filter((l) => !l?.isNote);
                  let sectionCompleted = false;
                  if (nonNoteLectures.length > 0) {
                    sectionCompleted = nonNoteLectures.every((lecture) => {
                      const id = lecture?._id;
                      if (!id) return false;
                      const lecProg =
                        lectureProgress?.[id] ||
                        lectureProgress?.[id?.toString?.()] ||
                        null;
                      return lecProg?.status === 'completed';
                    });
                  }

                  return (
                    <AccordionItem eventKey={ek} key={ek}>
                      <AccordionHeader id={`heading-${ek}`}>
                        <span className="mb-0 fw-bold d-inline-flex align-items-center">
                          {sec?.section || `Section ${sIdx + 1}`}
                          {isFutureSectionLocked && ' 🔒'}
                          {sectionCompleted && !isFutureSectionLocked && (
                            <BsCheckCircleFill
                              size={14}
                              className="text-success ms-2"
                              title="Section completed"
                            />
                          )}
                        </span>
                      </AccordionHeader>

                      <AccordionBody className="px-3">
                        <div className="vstack gap-3">
                          {lecturesInSection.map((lecture, lIdx) => {
                            const isQuotaLocked = limitByThree && lIdx >= 3;
                            const isLocked = isFutureSectionLocked || isQuotaLocked;

                            const isActive = currentId === lecture?._id;

                            const lecProg =
                              lectureProgress?.[lecture?._id] ||
                              lectureProgress?.[lecture?._id?.toString?.()] ||
                              {};

                            const status = lecProg?.status || 'not_started';
                            const isCompleted = status === 'completed';
                            const isInProgress = status === 'in_progress';
                            const hasProgress = !!lecProg && status !== 'not_started';

                            // ⭐️ TÍNH % PROGRESS
                            let progressPercent = 0;

                            if (typeof lecProg?.percentage === 'number') {
                              progressPercent = Math.round(lecProg.percentage);
                            } else {
                              const lastPos =
                                typeof lecProg?.lastPositionSec === 'number'
                                  ? lecProg.lastPositionSec
                                  : typeof lecProg?.currentTimeSec === 'number'
                                  ? lecProg.currentTimeSec
                                  : typeof lecProg?.positionSec === 'number'
                                  ? lecProg.positionSec
                                  : undefined;

                              const durFromProg =
                                typeof lecProg?.durationSec === 'number'
                                  ? lecProg.durationSec
                                  : undefined;

                              const durationBase =
                                durFromProg ??
                                (typeof lecture?.duration === 'number'
                                  ? lecture.duration
                                  : undefined);

                              if (
                                typeof lastPos === 'number' &&
                                typeof durationBase === 'number' &&
                                durationBase > 0
                              ) {
                                progressPercent = Math.round(
                                  (lastPos / durationBase) * 100
                                );
                              }
                            }

                            if (progressPercent > 100) progressPercent = 100;
                            if (progressPercent < 0 || !Number.isFinite(progressPercent)) {
                              progressPercent = 0;
                            }

                            if (isCompleted && progressPercent === 0) {
                              progressPercent = 100;
                            }

                            const timeLabel =
                              typeof lecture?.duration === 'number'
                                ? formatDuration(lecture.duration)
                                : lecture?.time || '--';

                            const isNote = Boolean(lecture?.isNote);

                            // 🎨 Variant + icon button theo trạng thái
                            let btnVariant = 'light';
                            let btnContent = null;

                            if (isLocked) {
                              btnVariant = 'light';
                              btnContent = <BsLockFill size={11} />;
                            } else if (isCompleted) {
                              btnVariant = 'success';
                              btnContent = <BsCheckCircleFill size={11} />;
                            } else if (isInProgress && hasProgress) {
                              btnVariant = 'outline-primary';
                              btnContent = (
                                <span className="small fw-bold">
                                  {progressPercent}%
                                </span>
                              );
                            } else {
                              btnVariant = 'primary';
                              btnContent = <FaPlay className="me-0" size={11} />;
                            }

                            let titleColorClass = '';
                            if (isCompleted) {
                              titleColorClass = 'text-success';
                            } else if (isInProgress) {
                              titleColorClass = 'text-primary';
                            } else if (isActive) {
                              titleColorClass = 'text-danger';
                            }

                            return (
                              <Fragment key={lecture?._id || `${sIdx}-${lIdx}`}>
                                {isNote ? (
                                  <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <div className="position-relative d-flex align-items-center">
                                        <a
                                          href="#"
                                          className="btn btn-danger-soft btn-round btn-sm mb-0 stretched-link position-static"
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          <FaPlay className="me-0" size={11} />
                                        </a>
                                        <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px">
                                          {lecture?.title || 'Untitled'}
                                        </span>
                                      </div>
                                      <p className="mb-0 text-truncate">{timeLabel}</p>
                                    </div>
                                    <PlayNote />
                                  </div>
                                ) : (
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="position-relative d-flex align-items-center">
                                      <Button
                                        variant={btnVariant}
                                        size="sm"
                                        className="btn-round mb-0 stretched-link position-static"
                                        onClick={() => {
                                          if (!isLocked) handlePlay(lecture);
                                        }}
                                        disabled={isLocked}
                                        title={lecture?.title}
                                      >
                                        {btnContent}
                                      </Button>

                                      <span
                                        className={
                                          `d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px ` +
                                          (titleColorClass || '')
                                        }
                                        title={lecture?.title}
                                      >
                                        {lecture?.title || 'Untitled'}
                                      </span>
                                    </div>

                                    <p className="mb-0 text-truncate">{timeLabel}</p>
                                  </div>
                                )}
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
          </Row>
        </CardBody>

        <CardFooter>
          <div className="d-grid">
            <Link to={`/student/courses/${course?._id || ''}`} className="btn btn-primary-soft mb-0">
              Back to Learning Course
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Modal Add Note */}
      <Modal
        show={isOpenAddNote}
        onHide={toggleAddNote}
        className="fade"
        id="Notemodal"
        tabIndex={-1}
        aria-labelledby="NotemodalLabel"
        aria-hidden="true"
      >
        <form onSubmit={handleSubmit(() => {})}>
          <ModalHeader closeButton>
            <h5 className="modal-title" id="NotemodalLabel">
              Add New Note
            </h5>
          </ModalHeader>
          <ModalBody>
            <TextFormInput
              name="note"
              label="Type your note *"
              placeholder="Type your note"
              control={control}
              containerClassName="col-12"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={toggleAddNote}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Note
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Playlist;
