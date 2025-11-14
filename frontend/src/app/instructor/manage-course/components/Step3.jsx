import AddSection from './AddSection';
import AddLecture from './AddLecture';
import { useState, useEffect } from 'react';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Row } from 'react-bootstrap';
import { FaEdit, FaPlay, FaTimes, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';


const Step3 = ({ stepperInstance, draftData, onSave }) => {
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
      toast.error("Please fix the errors on the page");
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
                      className="d-flex justify-content-between align-items-center px-2 pt-2"
                      role="group"
                      aria-label={`Lecture: ${lecture.title}`}
                    >
                      <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                        <Button
                          variant="danger-soft"
                          size="sm"
                          className="btn-round p-0 d-flex justify-content-center align-items-center"
                          aria-label={`Play lecture ${lecture.title}`}
                        >
                          <FaPlay />
                        </Button>
                        <span
                          className="ms-3 h6 fw-light text-truncate"
                          title={lecture.title}
                        >
                          {lecture.title}
                        </span>
                      </div>

                      <div className="d-flex align-items-center ms-3 flex-shrink-0">
                        <Button
                          variant="success-soft"
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
                    variant="dark"
                    size="sm"
                    onClick={() => openAddLectureModal(i)}
                    className="mb-0"
                  >
                    <FaPlus className="me-2" /> Add Lecture
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
      />
    </>
  );
};

export default Step3;
