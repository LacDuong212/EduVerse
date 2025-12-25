import AddSection from './AddSection';
import AddLecture from './AddLecture';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { FaEdit, FaTimes, FaPlus, FaRobot, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { FaSection } from 'react-icons/fa6';
import { toast } from 'react-toastify';


const Step3 = ({ stepperInstance, draftData, onSave }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // local state
  const [curriculum, setCurriculum] = useState([]);
  const [errors, setErrors] = useState({});

  // modal state
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingLectureIndex, setEditingLectureIndex] = useState(null);

  const curriculumJson = JSON.stringify(draftData?.curriculum || []);
  // init
  useEffect(() => {
    const data = draftData || {};
    setCurriculum(
      (data.curriculum || []).map(section => ({
        ...section,
        lectures: section.lectures || [],
      }))
    );
  }, [curriculumJson]);

  const handleGenerateAI = async (sectionIdx, lectureIdx) => {
    const section = curriculum[sectionIdx];
    const lecture = section.lectures[lectureIdx];

    // Validation kỹ trước khi gọi
    if (!draftData?._id || !lecture._id) {
      toast.warning("Please save the course changes first before generating AI.");
      return;
    }
    if (!lecture.videoUrl || typeof lecture.videoUrl !== 'string' || lecture.videoUrl.startsWith('blob:')) {
      toast.warning("Video must be uploaded and saved before AI processing.");
      return;
    }

    try {
      // Update UI ngay lập tức sang trạng thái Processing
      updateLectureAIStatus(sectionIdx, lectureIdx, 'Processing');
      toast.info("AI Background job started...");

      const { data } = await axios.post(
        `${backendUrl}/api/courses/generate-ai`,
        {
          courseId: draftData._id,
          lectureId: lecture._id,
          videoKey: lecture.videoUrl // Giả sử videoUrl chứa key hoặc url hợp lệ
        },
        { withCredentials: true }
      );

      if (!data.success) {
        throw new Error(data.message);
      }
      // Backend trả về success ngay, UI đã set Processing, Polling sẽ lo phần còn lại

    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(error.message || "Failed to start AI generation");
      updateLectureAIStatus(sectionIdx, lectureIdx, 'Failed');
    }
  };

  // 2. Helper update local state cho AI Status
  const updateLectureAIStatus = (sectionIdx, lectureIdx, status) => {
    setCurriculum(prev => {
      const updated = [...prev];
      // Đảm bảo object aiData tồn tại
      if (!updated[sectionIdx].lectures[lectureIdx].aiData) {
        updated[sectionIdx].lectures[lectureIdx].aiData = {};
      }
      updated[sectionIdx].lectures[lectureIdx].aiData.status = status;
      return updated;
    });
  };

  // 3. Polling: Tự động check trạng thái mỗi 10s nếu có lecture đang "Processing"
  useEffect(() => {
    const hasProcessingItems = curriculum.some(sec =>
      sec.lectures?.some(lec => lec.aiData?.status === 'Processing')
    );

    if (!hasProcessingItems || !draftData?._id) return;

    const intervalId = setInterval(async () => {
      try {
        // Gọi API lấy lại toàn bộ course để refresh status (hoặc viết API riêng check status lecture)
        const { data } = await axios.get(
          `${backendUrl}/api/instructor/courses/${draftData._id}`,
          { withCredentials: true }
        );

        if (data.success && data.course) {
          // Merge status mới vào curriculum hiện tại mà không làm mất các thay đổi chưa lưu khác (nếu có)
          setCurriculum(prev => {
            return prev.map((section, sIdx) => ({
              ...section,
              lectures: section.lectures.map((lec, lIdx) => {
                // Tìm lecture tương ứng trong data mới từ server
                const serverSection = data.course.curriculum.find(s => s.section === section.section); // Cần logic map tốt hơn nếu tên section trùng, tốt nhất là map theo _id
                const serverLecture = serverSection?.lectures?.find(l => l._id === lec._id); // Map theo ID là chuẩn nhất

                if (serverLecture && serverLecture.aiData?.status !== lec.aiData?.status) {
                  // Nếu status thay đổi (VD: Processing -> Completed), cập nhật lại lecture
                  return { ...lec, aiData: serverLecture.aiData };
                }
                return lec;
              })
            }));
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 10000); // 10 giây

    return () => clearInterval(intervalId);
  }, [curriculum, backendUrl, draftData?._id]);

  // these are calculated on every render
  const totalSections = curriculum.length;
  const totalLectures = curriculum.reduce(
    (acc, section) => acc + (section.lectures ? section.lectures.length : 0),
    0
  );

  // debounced auto-save 
  useEffect(() => {
    const localCurriculumJson = JSON.stringify(curriculum);

    // prevent auto-save if local state is identical to prop state
    if (localCurriculumJson === curriculumJson) {
      return;
    }

    // timer
    const handler = setTimeout(() => {
      console.log("Auto-saving curriculum...");

      onSave({
        curriculum: curriculum,
        lecturesCount: totalLectures
      });
    }, 2000); // 2-second delay

    // clear timer if curriculum changes early
    return () => {
      clearTimeout(handler);
    };

  }, [curriculum, totalLectures, onSave, curriculumJson]);

  // modal ---
  const openAddLectureModal = (sectionIdx) => {
    setEditingLecture(null);
    setEditingSectionIndex(sectionIdx);
    setEditingLectureIndex(null);
    setShowLectureModal(true);
  };

  const openEditLectureModal = (sectionIdx, lectureIdx) => {
    setEditingSectionIndex(sectionIdx);
    setEditingLectureIndex(lectureIdx);
    setEditingLecture(curriculum[sectionIdx].lectures[lectureIdx]);
    setShowLectureModal(true);
  };

  const closeLectureModal = () => {
    setShowLectureModal(false);
    setEditingLecture(null);
    setEditingSectionIndex(null);
    setEditingLectureIndex(null);
  };

  // curriculum ---
  const saveLecture = (lectureData) => {
    let lectureToSave = { ...lectureData };

    if (lectureData.videoFile) {
      toast.info('Handling video file...');
      const tempUrl = URL.createObjectURL(lectureData.videoFile);
      lectureToSave.videoUrl = tempUrl;
      lectureToSave.videoFile = null;
    }

    setCurriculum(prev => {
      const updated = [...prev];
      if (editingLectureIndex !== null && editingSectionIndex !== null) {
        updated[editingSectionIndex].lectures[editingLectureIndex] = lectureToSave;
      } else if (editingSectionIndex !== null) {
        const lectures = updated[editingSectionIndex].lectures || [];
        updated[editingSectionIndex].lectures = [...lectures, lectureToSave];
      }
      return updated;
    });

    closeLectureModal();
  };

  const handleRemoveLecture = (sectionIdx, lectureIdx) => {
    if (!window.confirm('Are you sure you want to remove this lecture?')) return;
    setCurriculum(prev => {
      const updated = [...prev];
      if (sectionIdx < 0 || sectionIdx >= updated.length) return prev;
      updated[sectionIdx].lectures.splice(lectureIdx, 1);
      return updated;
    });
  };

  const handleRemoveSection = (sectionIdx) => {
    if (!window.confirm('Are you sure you want to remove this section? All its lectures will be deleted!')) return;
    setCurriculum(prev => {
      const updated = [...prev];
      if (sectionIdx < 0 || sectionIdx >= updated.length) return prev;
      updated.splice(sectionIdx, 1);
      return updated;
    });
  };

  const addSection = (newSection) => {
    setCurriculum(prev => [...prev, { ...newSection, lectures: [] }]);
    if (errors.curriculum) setErrors(prev => ({ ...prev, curriculum: null }));
  };

  // nav
  const goToPreviousStep = (e) => {
    e.preventDefault();
    stepperInstance?.previous();
  };

  // validation
  const validate = () => {
    const newErrors = {};

    if (curriculum.length === 0) {
      newErrors.curriculum = 'Please add at least one section.';
    } else if (curriculum.some(sec => sec.lectures.length === 0)) {
      newErrors.curriculum = 'Please ensure all sections have at least one lecture.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please recheck course curriculum for errors.");
      return;
    }

    // saving draft
    try {
      onSave({
        curriculum,
        lecturesCount: totalLectures,
      });

      toast.success('Step 3 saved!');
      stepperInstance?.next();
    } catch (error) {
      toast.error('Failed to save curriculum');
    }
  };

  // AI
  const renderAIButton = (sectionIdx, lectureIdx, lecture) => {
    if (!draftData?._id || !lecture._id) return null;

    const status = lecture.aiData?.status || 'None';

    if (status === 'Processing') {
      return (
        <Button variant="purple-soft" size="sm" className="btn-round me-2 d-flex">
          <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="m-auto" />
        </Button>
      );
    }

    if (status === 'Completed') {
      return (
        <div className="d-flex align-items-center me-2">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Quiz Generated</Tooltip>}
          >
            <div className="position-relative">
              <Button
                variant="purple-soft"
                size="sm"
                className="btn-round"
                onClick={() => handleGenerateAI(sectionIdx, lectureIdx)}
              >
                <FaRobot />
              </Button>
              <FaCheckCircle
                className="position-absolute top-0 start-100 translate-middle text-success bg-white rounded-circle"
                fontSize={16}
              />
            </div>
          </OverlayTrigger>
        </div>
      );
    }

    return (
      <div className="d-flex align-items-center me-2">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{status === "Failed" ? "Generation Failed" : "Generate Quiz"}</Tooltip>}
        >
          <div className="position-relative">
            <Button
              variant={'purple-soft'}
              size="sm"
              className="btn-round position-relative"
              onClick={() => handleGenerateAI(sectionIdx, lectureIdx)}
            >
              <FaRobot />
            </Button>
            {(status === 'Failed') && <FaExclamationCircle
              className="position-absolute top-0 start-100 translate-middle text-danger rounded-circle d-flex 
            align-items-center justify-content-center"
              fontSize={16}
            />}
          </div>
        </OverlayTrigger>
      </div>
    );
  };

  return (
    <>
      <form
        id="step-3"
        role="tabpanel"
        className="content fade"
        aria-labelledby="steppertrigger3"
        onSubmit={handleSubmit}
      >
        <h4>
          Curriculum{" "}
          <span className="text-danger">* </span>
          <span className="fw-normal fs-5">(Sections: {totalSections}, Lectures: {totalLectures})</span>
        </h4>
        <hr />

        <Row>
          <div className="d-sm-flex justify-content-sm-between align-items-center mb-3">
            <h5 className="mb-2 mb-sm-0">Sections <span className="text-danger">*</span></h5>
            <AddSection onAddSection={addSection} />
          </div>

          {errors.curriculum && <div className="text-danger mb-2 text-center">{errors.curriculum}</div>}

          <Accordion className="accordion-icon accordion-bg-light" id="accordionExample2">
            {curriculum.length === 0 && (
              <div
                className="text-center text-secondary my-4 d-flex align-items-center justify-content-center"
                style={{ minHeight: '150px' }}
              >
                No sections added yet. Click "Add Section" to add a new section.
              </div>
            )}

            {curriculum.map((section, i) => (
              <AccordionItem eventKey={String(i + 1)} key={i} className="mb-2">
                <AccordionHeader as="h6" className="font-base" id={`heading-${i + 1}`}>
                  <div className="fw-bold me-2">{section.section}</div>
                  <span
                    role="button"
                    tabIndex={0}
                    className="btn btn-sm btn-danger-soft btn-round"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSection(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRemoveSection(i);
                      }
                    }}
                    title="Remove section"
                    aria-label={`Remove section ${section.section}`}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FaTimes />
                  </span>
                </AccordionHeader>
                <AccordionBody className="mt-2">
                  {(section.lectures || []).map((lecture, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between px-2 pt-2"
                      role="group"
                      aria-label={`Lecture: ${lecture.title}`}
                    >
                      <div className="d-flex align-items-center flex-grow-1 min-w-0">
                        <FaSection className="text-orange fs-5 me-2 flex-shrink-0" />

                        <span
                          className="h6 m-0 fw-light text-wrap"
                          title={lecture.title}
                        >
                          {lecture.title}
                        </span>
                      </div>

                      <div className="d-flex align-items-center">
                        {renderAIButton(i, idx, lecture)}

                        <Button
                          variant="primary-soft"
                          size="sm"
                          className="btn-round me-2"
                          onClick={() => openEditLectureModal(i, idx)}
                          title="Edit lecture"
                          aria-label={`Edit lecture ${lecture.title}`}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger-soft"
                          size="sm"
                          className="btn-round"
                          onClick={() => handleRemoveLecture(i, idx)}
                          title="Remove lecture"
                          aria-label={`Remove lecture ${lecture.title}`}
                          type="button"
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <hr />
                  <Button
                    variant="orange-soft"
                    size="sm"
                    onClick={() => openAddLectureModal(i)}
                    className="mb-0"
                  >
                    <FaPlus className="mb-1 me-1" /> Add Lecture
                  </Button>
                </AccordionBody>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="d-flex justify-content-between mt-3">
            <button type="button" className="btn btn-secondary prev-btn mb-0" onClick={goToPreviousStep}>
              Previous
            </button>
            <button type="submit" className="btn btn-primary next-btn mb-0">
              Next
            </button>
          </div>
        </Row>
      </form>

      <AddLecture
        show={showLectureModal}
        onClose={closeLectureModal}
        onSave={saveLecture}
        initialLecture={editingLecture}
        courseId={draftData?._id}
      />
    </>
  );
};

export default Step3;
