import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Alert, Button, Row, Spinner } from "react-bootstrap";
import { FaEdit, FaTimes, FaPlus, FaRobot, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FaSection } from "react-icons/fa6";
import AiData from "../ai";
import Lecture from "../lecture";
import Section from "../section";
import { useStep3 } from "./useStep3";

const Step3 = ({ stepperInstance, activeStep }) => {
  const { state, section, lecture, ai, handlers } = useStep3(stepperInstance);
  const { course, curriculum, errors, stats, courseId } = state;

  // AI Button
  const renderAIButton = (secIdx, lecIdx, lec) => {
    if (!courseId || !lec?.lecId || course?.status !== "live") return null;

    const status = lec.aiData?.status || "none";

    let tooltip = "AI Assistant";
    let badge = null;

    if (status === "processing") {
      return (
        <Button variant="purple-soft" size="sm" className="btn-round mb-0 me-2 d-flex align-items-center justify-content-center" onClick={() => ai.open(secIdx, lecIdx)}>
          <Spinner animation="border" size="sm" className="" />
        </Button>
      );
    }
    else if (status === "completed") {
      tooltip = "View AI Content";
      badge = <FaCheckCircle className="position-absolute top-0 translate-middle text-success bg-white rounded-circle" fontSize={16} />;
    }
    else if (status === "failed") {
      tooltip = "Generation Failed";
      badge = <FaExclamationCircle className="position-absolute top-0 translate-middle text-danger bg-white rounded-circle" fontSize={16} />;
    }

    return (
      <div className="position-relative me-2">
        <Button
          variant="purple-soft"
          size="sm"
          className="btn-round mb-0"
          title={tooltip}
          onClick={() => ai.open(secIdx, lecIdx)}
        >
          <FaRobot />
        </Button>
        {badge}
      </div>
    );
  };

  return (
    <>
      <form id="step-3" className="content fade" onSubmit={handlers.handleSubmit}>
        <Row>
          {/* Header & Add Section Button */}
          <div className="d-sm-flex justify-content-sm-between align-items-center">
            <div>
              <h5 className="mb-2 mb-sm-0">Sections <span className="text-danger">*</span></h5>
              <span className="fs-6">Total: {stats.totalSections} Sections, {stats.totalLectures} Lectures</span>
            </div>
            <Button variant="info-soft" size="sm" className="mb-0" onClick={() => section.open()}>
              <FaPlus className="me-1" /> Add Section
            </Button>
          </div>

          {errors["curriculum"] && <div><Alert variant="danger" className="mt-3 mb-0">{errors["curriculum"]}</Alert></div>}
          {errors["curriculum.sections"] && <div><Alert variant="danger" className="mt-3 mb-0">{errors["curriculum.sections"]}</Alert></div>}

          {/* Content */}
          <Accordion defaultActiveKey="0" className="accordion-icon accordion-bg-light">
            {curriculum.length === 0 && (
              <div className="text-center text-secondary mt-3 py-5 border rounded bg-light">
                No sections added yet. Click "Add Section" to start.
              </div>
            )}

            {curriculum.map((sec, i) => {
              const sectionPath = `curriculum.sections.${i}`;
              const sectionTitleErr = errors[`${sectionPath}.title`];
              const sectionLecturesErr = errors[`${sectionPath}.lectures`];

              return (
                <AccordionItem eventKey={String(i)} key={i} className="mt-3 border rounded overflow-hidden">
                  <AccordionHeader className="font-base">
                    <div className="d-flex flex-column me-2">
                      <span className={`h6 mb-0 text-break ${sectionTitleErr || sectionLecturesErr ? "text-danger" : ""}`}>
                        {sec.title}
                      </span>
                      {sectionTitleErr && (
                        <div className="text-danger small">
                          {sectionTitleErr}
                        </div>
                      )}
                      {sectionLecturesErr && (
                        <div className="text-danger small">
                          {sectionLecturesErr}
                        </div>
                      )}
                    </div>

                    {/* Section Controls (Edit/Delete) */}
                    <div className="ms-auto d-flex align-items-center me-4" onClick={e => e.stopPropagation()}>
                      <span
                        role="button"
                        className="btn btn-sm btn-primary-soft btn-round me-1 mb-0"
                        onClick={() => section.open(i, sec)}
                        title="Edit Section"
                      >
                        <FaEdit size={12} />
                      </span>
                      <span
                        role="button"
                        className="btn btn-sm btn-danger-soft btn-round mb-0"
                        onClick={() => section.remove(i)}
                        title="Remove Section"
                      >
                        <FaTimes size={13} />
                      </span>
                    </div>
                  </AccordionHeader>

                  <AccordionBody className="pt-0">
                    {/* Lectures List */}
                    {(sec.lectures || []).map((lec, idx) => {
                      const lecPath = `curriculum.sections.${i}.lectures.${idx}`;
                      const aiPath = `${lecPath}.aiData`;
                      const lessonNotesPath = `${aiPath}.lessonNotes`;

                      const lecTitleErr = errors[`${lecPath}.title`];
                      const lecVideoErr = errors[`${lecPath}.videoId`];
                      const lecDurationErr = errors[`${lecPath}.duration`];
                      const lecDescriptionErr = errors[`${lecPath}.description`];

                      const aiDataErr = errors[aiPath];
                      const aiSummaryErr = errors[`${aiPath}.summary`];
                      const lessonNotesErr = errors[`${aiPath}.lessonNotes`];
                      const aiQuizzesErr = errors[`${aiPath}.quizzes`];

                      const mainPointsStructuralErr = errors[`${lessonNotesPath}.mainPoints`];
                      const practicalTipsStructuralErr = errors[`${lessonNotesPath}.practicalTips`];
                      const keyConceptsStructuralErr = errors[`${lessonNotesPath}.keyConcepts`];

                      const arrayErrors = [];

                      Object.entries(errors).forEach(([key, message]) => {
                        if (key.startsWith(`${lessonNotesPath}.mainPoints.`)) {
                          const index = key.split('.').pop();
                          arrayErrors.push(`Main point item ${Number(index) + 1}: ${message}`);
                        }

                        else if (key.startsWith(`${lessonNotesPath}.practicalTips.`)) {
                          const index = key.split('.').pop();
                          arrayErrors.push(`Practical tip item ${Number(index) + 1}: ${message}`);
                        }

                        else if (key.startsWith(`${lessonNotesPath}.keyConcepts.`)) {
                          const parts = key.split('.');
                          const field = parts.pop();
                          const index = parts.pop();
                          const fieldLabel = field === "term" ? "Term" : "Definition";
                          arrayErrors.push(`Key concept item ${Number(index) + 1} (${fieldLabel}): ${message}`);
                        }

                        else if (key.startsWith(`${aiPath}.quizzes.`)) {
                          const parts = key.split('.');

                          const quizzesSegmentIndex = parts.indexOf("quizzes");

                          if (quizzesSegmentIndex !== -1) {
                            const questionIndex = parts[quizzesSegmentIndex + 1];
                            const remainingParts = parts.slice(quizzesSegmentIndex + 2);

                            const field = remainingParts[0];

                            if (field === "options") {
                              const optionIndex = remainingParts[1];
                              arrayErrors.push(`Question ${Number(questionIndex) + 1} (Option ${Number(optionIndex) + 1}): ${message}`);
                            } else {
                              const fieldLabels = {
                                question: "Question Text",
                                correctAnswer: "Correct Answer",
                                explanation: "Explanation",
                                topic: "Topic"
                              };
                              const label = fieldLabels[field] || field;
                              arrayErrors.push(`Question ${Number(questionIndex) + 1} (${label}): ${message}`);
                            }
                          }
                        }
                      });

                      const hasAnyError = lecTitleErr || lecVideoErr || lecDurationErr || lecDescriptionErr ||
                        aiDataErr || aiSummaryErr || lessonNotesErr || aiQuizzesErr ||
                        mainPointsStructuralErr || practicalTipsStructuralErr || keyConceptsStructuralErr ||
                        arrayErrors.length > 0;

                      return (
                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom hover-bg-light transition-base">
                          <div className="d-flex align-items-center flex-grow-1 min-w-0 me-3">
                            <FaSection className="text-orange fs-5 me-2 flex-shrink-0" />
                            <div className="d-flex flex-column">
                              <span className={`h6 m-0 text-break ${hasAnyError ? "text-danger" : ""}`} title={lec.title}>
                                {lec.title}
                              </span>

                              {lecTitleErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {lecTitleErr}
                                </small>
                              )}
                              {lecVideoErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {lecVideoErr}
                                </small>
                              )}
                              {lecDurationErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {lecDurationErr}
                                </small>
                              )}
                              {lecDescriptionErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {lecDescriptionErr}
                                </small>
                              )}
                              {aiDataErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {aiDataErr}
                                </small>
                              )}
                              {aiSummaryErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {aiSummaryErr}
                                </small>
                              )}
                              {lessonNotesErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {lessonNotesErr}
                                </small>
                              )}
                              {mainPointsStructuralErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {mainPointsStructuralErr}
                                </small>
                              )}
                              {practicalTipsStructuralErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {practicalTipsStructuralErr}
                                </small>
                              )}
                              {keyConceptsStructuralErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {keyConceptsStructuralErr}
                                </small>
                              )}
                              {aiQuizzesErr && (
                                <small className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {aiQuizzesErr}
                                </small>
                              )}

                              {arrayErrors.map((errMsg, errIdx) => (
                                <small key={errIdx} className="text-danger small" style={{ fontSize: '0.75rem' }}>
                                  {errMsg}
                                </small>
                              ))}
                            </div>
                          </div>

                          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                            {renderAIButton(i, idx, lec)}
                            <Button
                              variant="primary-soft" size="sm" className="btn-round mb-0"
                              title="Edit Lecture"
                              onClick={() => lecture.open(i, idx, lec)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="danger-soft" size="sm" className="btn-round mb-0"
                              title="Remove Lecture"
                              onClick={() => lecture.remove(i, idx)}
                            >
                              <FaTimes />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-3 text-center">
                      <Button
                        variant="orange-soft" size="sm"
                        onClick={() => lecture.open(i)}
                      >
                        <FaPlus className="mb-1 me-1" /> Add Lecture
                      </Button>
                    </div>
                  </AccordionBody>
                </AccordionItem>
              );
            })}
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
        show={section.show}
        onClose={section.close}
        onSave={section.save}
        initialSection={section.data}
      />

      {/* Add/Edit Lecture Modal */}
      <Lecture
        show={lecture.show}
        onClose={lecture.close}
        onSave={lecture.save}
        initialLecture={lecture.data}
      />

      {/* AI Data Modal */}
      <AiData
        show={ai.show}
        onClose={ai.close}
        lecture={ai.data}
        onGenerate={ai.generate}
        onUpdate={ai.update}
        onDelete={ai.delete}
      />
    </>
  );
};

export default Step3;