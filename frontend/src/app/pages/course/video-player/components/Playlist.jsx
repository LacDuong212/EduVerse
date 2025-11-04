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
import { BsLockFill, BsPencilSquare, BsPlayFill, BsTrashFill } from 'react-icons/bs';
import { FaPlay } from 'react-icons/fa';
import * as yup from 'yup';

/**
 * Props:
 * - course: object từ API getCourseById (bắt buộc)
 * - onSelect?: (lecture) => void  // callback khi chọn bài (nếu không truyền sẽ navigate theo route)
 * - currentId?: string            // _id lecture đang phát để active UI
 */
const Playlist = ({ course, onSelect, currentId }) => {
  const navigate = useNavigate();

  const { isTrue: isOpenAddNote, toggle: toggleAddNote } = useToggle();
  const { isTrue: isOpenInlineNote, toggle: toggleInlineNote } = useToggle();

  // Chuẩn hóa dữ liệu từ course.curriculum
  const sections = useMemo(
    () => (Array.isArray(course?.curriculum) ? course.curriculum : []),
    [course]
  );

  // -------- NEW: quản lý active section theo currentId (controlled Accordion) ----------
  // Tạo eventKey ổn định cho mỗi section (ưu tiên _id nếu có)
  const sectionKeys = useMemo(
    () => sections.map((sec, idx) => String(sec?._id ?? idx)),
    [sections]
  );

  // Tìm eventKey (section) chứa lecture hiện tại
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
    // chỉ cần phụ thuộc currentId + kích thước sections để tránh re-run không cần thiết
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, sections.length]);
  // ------------------------------------------------------------------------------------

  // Schema note (giữ logic form cũ của bạn)
  const noteSchema = yup.object({
    note: yup.string().required('please enter your note'),
  });
  const { control, handleSubmit } = useForm({ resolver: yupResolver(noteSchema) });

  // Format duration (giờ -> "Hh Mm"), fallback "--"
  const formatDuration = (hours) => {
    if (typeof hours !== 'number' || isNaN(hours)) return '--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h <= 0 && m <= 0) return '--';
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  // Component hiển thị note inline (demo giữ như cũ)
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

  // Handler chọn bài: ưu tiên gọi onSelect; nếu không có thì navigate theo route bạn đang dùng
  const handlePlay = (lecture) => {
    if (!lecture) return;
    if (typeof onSelect === 'function') onSelect(lecture);
    else navigate(`/courses/${course._id}/watch/${lecture._id}`); // 👈 SPA điều hướng
  };

  return (
    <>
      <Card className="vh-100 overflow-auto rounded-0 w-280px w-sm-400px">
        <CardHeader className="bg-light rounded-0">
          <h1 className="mt-2 fs-5">{course?.title || 'Course'}</h1>
          {course?.instructor?.ref && (
            <h6 className="mb-0 fw-normal">
              {/* Nếu có tên instructor, thay anchor này */}
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
              {/* Controlled Accordion để không tự reset về section 1 */}
              <Accordion
                activeKey={activeKey}
                onSelect={(ek) => setActiveKey(ek)}
                flush
                className="accordion-flush-light"
                id="accordionExample"
              >
                {sections.map((sec, sIdx) => {
                  const ek = String(sec?._id ?? sIdx);
                  return (
                    <AccordionItem eventKey={ek} key={ek}>
                      <AccordionHeader id={`heading-${ek}`}>
                        <span className="mb-0 fw-bold">{sec?.section || `Section ${sIdx + 1}`}</span>
                      </AccordionHeader>

                      <AccordionBody className="px-3">
                        <div className="vstack gap-3">
                          {(sec?.lectures || []).map((lecture, lIdx) => {
                            const isLockedUI = !lecture?.isFree; // chỉ hiển thị icon khóa; không chặn click
                            const isActive = currentId === lecture?._id;
                            const timeLabel =
                              typeof lecture?.duration === 'number'
                                ? formatDuration(lecture.duration)
                                : (lecture?.time || '--');

                            const isNote = Boolean(lecture?.isNote); // nếu dữ liệu cũ có cờ này thì vẫn render block note

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
                                      {/* Icon trạng thái: free/play hoặc locked (không disable) */}
                                      <Button
                                        variant={isActive ? 'danger' : isLockedUI ? 'light' : 'danger-soft'}
                                        size="sm"
                                        className="btn-round mb-0 stretched-link position-static"
                                        onClick={() => handlePlay(lecture)}
                                        title={lecture?.title}
                                      >
                                        {isLockedUI ? <BsLockFill size={11} /> : <FaPlay className="me-0" size={11} />}
                                      </Button>

                                      <span
                                        className={`d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px ${
                                          isActive ? 'text-danger' : ''
                                        }`}
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
            <Link to={`/courses/${course?._id || ''}`} className="btn btn-primary-soft mb-0">
              Back to course
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
