import React, { useEffect, useRef } from "react";
import { Accordion, Alert, Badge, Button, Form, Modal, ModalBody, ModalFooter, ModalHeader, Nav, OverlayTrigger, Tab, Tooltip } from "react-bootstrap";
import { BsXLg } from "react-icons/bs";
import { FaCheckCircle, FaClock, FaEdit, FaLightbulb, FaListUl, FaPlayCircle, FaQuestionCircle, FaRedo, FaRobot, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { useAiData } from "./useAiData";

const secsToMMSS = (secs) => {
  if (secs == null || isNaN(secs)) return "";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const AiData = ({ show, onClose, lecture, onGenerate, onUpdate, onDelete, onCancel }) => {
  const { state, data, editedData, handlers } = useAiData(lecture, show, onUpdate);
  const videoRef = useRef(null);
  const displayVideoUrl = data?.videoUrl;

  useEffect(() => {
    if (state.activeTab !== "source" && videoRef.current) {
      videoRef.current.pause();
    }
  }, [state.activeTab]);

  useEffect(() => {
    if (!show && videoRef.current) {
      videoRef.current.pause();
    }
  }, [show]);

  const renderVideoPlayer = (url) => (
    <div className="rounded overflow-hidden border bg-black">
      <video
        ref={videoRef}
        key={url}
        controls
        className="w-100"
        style={{ maxHeight: "300px", display: "block" }}
        preload="metadata"
      >
        <source src={url} />
        Your browser does not support the video tag.
      </video>
    </div>
  );

  if (!lecture) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      <ModalHeader className="bg-purple text-white d-flex align-items-center justify-content-between">
        <div className="d-flex flex-column">
          <h5 className="modal-title text-white">AI Generated Content</h5>
          <div className="text-break">{data?.title}</div>
        </div>
        <div className="d-flex align-items-center gap-3">
          {state.hasData && !state.isProcessing && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{state.isEditing ? "Cancel" : "Edit"}</Tooltip>}
            >
              <Button
                variant={state.isEditing ? "" : "purple"}
                size="sm"
                onClick={state.isEditing ? handlers.handleCancel : handlers.startEditing}
                className={`text-white btn rounded-circle mb-0 p-2 flex-shrink-0 mb-0 ${state.isEditing ? "border-white border-2" : ""}`}
              >
                <FaEdit size={18} />
              </Button>
            </OverlayTrigger>
          )}
          <Button
            variant="purple"
            size="sm"
            onClick={onClose}
            className="text-white btn rounded-circle mb-0 p-2 flex-shrink-0"
          >
            <BsXLg size={25} />
          </Button>
        </div>
      </ModalHeader>

      <ModalBody className="p-3">
        {state.isProcessing && (
          <div className="text-center">
            <div className="spinner-border text-purple mb-3" role="status"></div>
            <h5 className="mb-0">Generating content...</h5>
            <p className="mb-0">This may take a minute. You can close this window safely.</p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button variant="outline-danger" size="sm" className="mb-0" onClick={() => onCancel?.()}>Cancel</Button>
            </div>
          </div>
        )}

        {state.isFailed && (
          <Alert variant="danger" className="mb-0">
            <h5 className="alert-heading mb-0">Generation Failed</h5>
            <p className="mb-0">Something went wrong while processing the video. Please try again.</p>
          </Alert>
        )}

        {!state.isProcessing && !state.isFailed && !state.hasData && (
          <div>
            <div className="text-center mb-3">
              <FaRobot size={40} className="mb-2 text-purple" />
              <h5 className="mb-0">No generated content found.</h5>
            </div>
            {displayVideoUrl ? (
              <>
                <div className="px-0 px-sm-3 px-md-4 px-lg-5 mb-3">
                  {renderVideoPlayer(displayVideoUrl)}
                  <span className="mt-2 px-1 small"><strong>*</strong> Source video for AI generated content.</span>
                </div>
                <div className="text-center pb-2">
                  <Button variant="purple" className="mb-0" onClick={onGenerate}>
                    Generate
                  </Button>
                </div>
              </>
            ) : (
              <Alert variant="warning" className="mb-0">
                No video file found for this lecture. Please upload a video first.
              </Alert>
            )}
          </div>
        )}

        {state.hasData && editedData && (
          <Tab.Container activeKey={state.activeTab} onSelect={handlers.setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="summary"><FaListUl className="mb-1 me-2" /> Summary</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="concepts"><FaLightbulb className="mb-1 me-2" /> Concepts</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="quiz"><FaQuestionCircle className="mb-1 me-2" /> Quiz <Badge bg="purple" className="ms-2">{editedData.quizzes?.length}</Badge></Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="source" disabled={state.isEditing}><FaPlayCircle className="mb-1 me-2" /> Source</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* TAB: Summary */}
              <Tab.Pane eventKey="summary">
                <div className="px-1">
                  <h6>Video Summary</h6>
                  {state.isEditing ? (
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={editedData.summary}
                      onChange={(e) => handlers.handleSummaryChange(e.target.value)}
                      className="mb-3"
                    />
                  ) : (
                    <p className="mb-0">{editedData.summary}</p>
                  )}

                  {editedData.mainPoints?.length > 0 && (
                    <>
                      <h6 className="mt-4">Main Takeaways</h6>
                      <ul className="list-group list-group-flush">
                        {editedData.mainPoints.map((point, idx) => (
                          <li key={idx} className="list-group-item bg-transparent px-0 py-2 d-flex align-items-start border-0">
                            <FaCheckCircle className="text-purple mt-1 me-2 flex-shrink-0" size={14} />
                            {state.isEditing ? (
                              <Form.Control
                                as="textarea"
                                value={point}
                                onChange={(e) => handlers.handleMainPointChange(idx, e.target.value)}
                              />
                            ) : (
                              <span>{point}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {editedData.practicalTips?.length > 0 && (
                    <>
                      <h6 className="mt-4">Practical Tips</h6>
                      <ul className="list-group list-group-flush">
                        {editedData.practicalTips.map((tip, idx) => (
                          <li key={idx} className="list-group-item bg-transparent px-0 py-2 d-flex align-items-start border-0">
                            <span className="badge bg-purple rounded-circle me-2 mt-1 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "20px", height: "20px", fontSize: "11px" }}>
                              {idx + 1}
                            </span>
                            {state.isEditing ? (
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={tip}
                                onChange={(e) => handlers.handlePracticalTipChange(idx, e.target.value)}
                              />
                            ) : (
                              <span>{tip}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </Tab.Pane>

              {/* TAB: Key Concepts */}
              <Tab.Pane eventKey="concepts">
                <div className="row g-3 px-1">
                  {editedData.keyConcepts?.length === 0 && <p className="text-center my-5">No key concepts identified.</p>}
                  {editedData.keyConcepts?.map((item, idx) => (
                    <div key={idx} className="col-12">
                      <div className="card bg-light border-0 shadow-sm">
                        <div className="card-body p-3">
                          {state.isEditing ? (
                            <>
                              <Form.Control
                                className="fw-bold text-purple mb-2"
                                value={item.term}
                                onChange={(e) => handlers.handleConceptChange(idx, "term", e.target.value)}
                              />
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={item.definition}
                                onChange={(e) => handlers.handleConceptChange(idx, "definition", e.target.value)}
                              />
                            </>
                          ) : (
                            <>
                              <h6 className="text-purple mb-1">{item.term}</h6>
                              <p className="mb-0">{item.definition}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>

              {/* TAB: Quiz */}
              <Tab.Pane eventKey="quiz">
                <style>{`
                  .custom-quiz-accordion .accordion-button:not(.collapsed) {
                    background-color: rgba(var(--bs-purple-rgb), 0.1) !important; 
                    color: var(--bs-purple) !important;
                  }
                  .custom-quiz-accordion .accordion-button:focus {
                    border-color: var(--bs-purple) !important;
                    box-shadow: 0 0 0 0.25rem rgba(var(--bs-purple-rgb), 0.25) !important;
                  }
                  .custom-quiz-accordion .accordion-button:not(.collapsed)::after {
                    filter: invert(26%) sepia(89%) saturate(5435%) hue-rotate(264deg) brightness(96%) contrast(99%);
                  }
                `}</style>
                <Accordion defaultActiveKey="0" className="px-1 custom-quiz-accordion">
                  {editedData.quizzes?.length === 0 && <p className="text-center my-5">No quizzes generated.</p>}
                  {editedData.quizzes?.map((q, idx) => (
                    <Accordion.Item eventKey={String(idx)} key={idx} className="mb-2 border rounded overflow-hidden">
                      <Accordion.Header>
                        <span className="fw-bold me-2 text-purple">Q{idx + 1}.</span> {q.question}
                      </Accordion.Header>
                      <Accordion.Body className="p-3">
                        {state.isEditing ? (
                          <>
                            <Form.Label className="small fw-bold">Question</Form.Label>
                            <Form.Control
                              className="mb-3 fw-semibold"
                              value={q.question}
                              onChange={(e) => handlers.handleQuizChange(idx, "question", e.target.value)}
                            />
                            <Form.Label className="small fw-bold">Options</Form.Label>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="d-flex align-items-center mb-2 gap-2">
                                <Form.Check
                                  type="radio"
                                  name={`correct-ans-${idx}`}
                                  checked={opt === q.correctAnswer}
                                  onChange={() => handlers.handleQuizChange(idx, "correctAnswer", opt)}
                                />
                                <Form.Control
                                  value={opt}
                                  onChange={(e) => handlers.handleQuizOptionChange(idx, oIdx, e.target.value)}
                                />
                              </div>
                            ))}
                            <Form.Label className="small fw-bold mt-2">Explanation</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={q.explanation}
                              onChange={(e) => handlers.handleQuizChange(idx, "explanation", e.target.value)}
                              className="mb-3"
                            />
                            <Form.Label className="small fw-bold d-flex align-items-center gap-1">
                              <FaClock size={12} /> Timestamp (MM:SS)
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. 02:30"
                              value={secsToMMSS(q.timestamp)}
                              onChange={(e) => handlers.handleQuizTimestampChange(idx, e.target.value)}
                              style={{ maxWidth: 120 }}
                            />
                            <Form.Text className="text-body-secondary">Video will pause here to show this question</Form.Text>
                          </>
                        ) : (
                          <>
                            {q.timestamp != null && (
                              <div className="mb-2">
                                <Badge bg="secondary" className="d-inline-flex align-items-center gap-1">
                                  <FaClock size={10} /> {secsToMMSS(q.timestamp)}
                                </Badge>
                              </div>
                            )}
                            <div className="mb-3">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = opt === q.correctAnswer;
                                return (
                                  <div key={oIdx} className={`p-2 border rounded mb-2 d-flex align-items-center ${isCorrect ? "bg-success bg-opacity-10 border-success text-success" : ""}`}>
                                    {isCorrect && <FaCheckCircle className="me-2 flex-shrink-0" />}
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="p-2 rounded border bg-purple bg-opacity-10 small">
                              <strong>Explanation: </strong> {q.explanation}
                            </div>
                          </>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Tab.Pane>

              {/* TAB: Source */}
              <Tab.Pane eventKey="source">
                <div className="px-1">
                  {displayVideoUrl ? renderVideoPlayer(displayVideoUrl) : (
                    <p variant="info" className="text-center my-5">No source video available.</p>
                  )}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        )}
      </ModalBody>

      <ModalFooter className="justify-content-between bg-light">
        {state.isEditing ? (
          <>
            <Button variant="outline-secondary" size="sm" className="mb-0" onClick={handlers.handleCancel}>Discard</Button>
            <Button variant="purple" size="sm" className="mb-0" onClick={handlers.handleSave}><FaSave className="me-1" /> Save Changes</Button>
          </>
        ) : (
          <>
            <Button variant="outline-danger" size="sm" onClick={() => onCancel?.()}>Cancel</Button>
            {(state.hasData || state.isFailed) && (
              <div className="d-flex gap-2">
                {state.hasData && (<Button variant="outline-danger" size="sm" className="mb-0" onClick={onDelete}><FaTrash className="me-1" /> Delete</Button>)}
                <Button variant="outline-purple" size="sm" className="mb-0" onClick={onGenerate}><FaRedo className="me-1" /> Regenerate</Button>
              </div>
            )}
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default AiData;