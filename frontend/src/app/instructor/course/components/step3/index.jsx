import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Alert, Button, Row, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { FaEdit, FaTimes, FaPlus, FaRobot, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FaSection } from "react-icons/fa6";
import Section from "../section";
import Lecture from "../lecture";
import AiData from "../ai";
import { useStep3 } from "./useStep3";
import { useCourseEditor } from "../../CourseEditorContext";

const Step3 = ({ stepperInstance }) => {
  const { data, modals, handlers } = useStep3(stepperInstance);
  const { curriculum, errors, stats, courseId } = data;
  const { currentCourse: course } = useCourseEditor();

  // AI Button
  const renderAIButton = (secIdx, lecIdx, lecture) => {
    if (!courseId || !lecture?.id) return null;
    if (course?.status !== "Live" && course?.status !== "Pending") return null;
    
    const status = lecture.aiData?.status || "None";

    let btnVariant = "purple-soft";
    let tooltip = "AI Assistant";
    let Icon = FaRobot;
    let badge = null;

    if (status === "Processing") {
       return (
        <Button variant="purple-soft" size="sm" className="btn-round mb-0 me-2 d-flex" onClick={() => handlers.openAIModal(secIdx, lecIdx)}>
           <Spinner animation="border" size="sm" />
        </Button>
       );
    } 
    else if (status === "Completed") {
       tooltip = "View AI Content";
       badge = <FaCheckCircle className="position-absolute top-0 start-100 translate-middle text-success bg-white rounded-circle" fontSize={16} />;
    } 
    else if (status === "Failed") {
       tooltip = "Generation Failed";
       badge = <FaExclamationCircle className="position-absolute top-0 start-100 translate-middle text-danger bg-white rounded-circle" fontSize={16} />;
    }

    return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
        <div className="position-relative me-2">
          <Button
            variant={btnVariant}
            size="sm"
            className="btn-round mb-0"
            onClick={() => handlers.openAIModal(secIdx, lecIdx)}
          >
            <Icon />
          </Button>
          {badge}
        </div>
      </OverlayTrigger>
    );
  };

  return (
    <>
      <form id="step-3" className="content fade" onSubmit={handlers.handleSubmit}>
        <h4>
          Curriculum <span className="text-danger">* </span>
          <span className="fw-normal fs-5">(Sections: {stats.totalSections}, Lectures: {stats.totalLectures})</span>
        </h4>
        <hr />

        <Row>
          {/* Header & Add Section Button */}
          <div className="d-sm-flex justify-content-sm-between align-items-center">
            <h5 className="mb-2 mb-sm-0">Sections <span className="text-danger">*</span></h5>
            <Button variant="info-soft" size="sm" className="mb-0" onClick={handlers.openAddSection}>
              <FaPlus className="me-1" /> Add Section
            </Button>
          </div>

          {errors.curriculum && <div><Alert variant="danger" className="mt-3 mb-0">{errors.curriculum}</Alert></div>}

          {/* Curriculum Accordion */}
          <Accordion defaultActiveKey="0" className="accordion-icon accordion-bg-light">
            {curriculum.length === 0 && (
              <div className="text-center text-secondary mt-3 py-5 border rounded bg-light">
                No sections added yet. Click "Add Section" to start.
              </div>
            )}

            {curriculum.map((section, i) => (
              <AccordionItem eventKey={String(i)} key={i} className="mt-3 border rounded overflow-hidden">
                <AccordionHeader as="h6" className="font-base">
                  <div className="fw-bold text-break me-2">{section.section}</div>
                  
                  {/* Section Controls (Edit/Delete) */}
                  <div className="ms-auto d-flex align-items-center me-4" onClick={e => e.stopPropagation()}>
                    <span 
                        role="button" 
                        className="btn btn-sm btn-primary-soft btn-round me-1 mb-0" 
                        onClick={() => handlers.openEditSection(i, section)}
                        title="Edit Section Name"
                    >
                       <FaEdit size={12}/>
                    </span>
                    <span 
                        role="button" 
                        className="btn btn-sm btn-danger-soft btn-round mb-0" 
                        onClick={() => handlers.handleRemoveSection(i)}
                        title="Remove Section"
                    >
                       <FaTimes size={13}/>
                    </span>
                  </div>
                </AccordionHeader>

                <AccordionBody className="pt-0">
                  {/* Lectures List */}
                  {(section.lectures || []).map((lecture, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom hover-bg-light transition-base">
                      <div className="d-flex align-items-center flex-grow-1 min-w-0 me-3">
                        <FaSection className="text-orange fs-5 me-2 flex-shrink-0" />
                        <span className="h6 m-0 fw-light text-break" title={lecture.title}>
                          {lecture.title}
                        </span>
                      </div>

                      <div className="d-flex align-items-center">
                        {renderAIButton(i, idx, lecture)}

                        <Button
                          variant="primary-soft" size="sm" className="btn-round me-2 mb-0"
                          onClick={() => handlers.openEditLecture(i, idx, lecture)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger-soft" size="sm" className="btn-round mb-0"
                          onClick={() => handlers.handleRemoveLecture(i, idx)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Lecture Button inside Section */}
                  <div className="mt-3 text-center">
                    <Button
                      variant="orange-soft" size="sm"
                      onClick={() => handlers.openAddLecture(i)}
                    >
                      <FaPlus className="mb-1 me-1" /> Add Lecture
                    </Button>
                  </div>
                </AccordionBody>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-outline-secondary mb-0" onClick={handlers.goBack}>
              Previous
            </button>
            <button type="submit" className="btn btn-primary mb-0">
              Next
            </button>
          </div>
        </Row>
      </form>

      {/* --- MODALS --- */}
      
      {/* Add/Edit Section Modal */}
      <Section
        show={modals.section.show}
        onClose={modals.section.close}
        onSave={handlers.handleSaveSection}
        initialSection={modals.section.data} 
      />

      {/* Add/Edit Lecture Modal */}
      <Lecture
        show={modals.lecture.show}
        onClose={modals.lecture.close}
        onSave={handlers.handleSaveLecture}
        initialLecture={modals.lecture.data}
        courseId={courseId}
      />

      {/* AI Data Modal */}
      <AiData 
        show={modals.ai.show}
        onClose={modals.ai.close}
        lecture={modals.ai.data}
        onGenerate={handlers.handleGenerateAI}
        onDelete={handlers.handleDeleteAI}
      />
    </>
  );
};

export default Step3;