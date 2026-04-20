import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Nav, Tab, Accordion, Badge, Alert } from "react-bootstrap";
import { BsXLg } from "react-icons/bs";
import { FaRobot, FaRedo, FaTrash, FaCheckCircle, FaLightbulb, FaListUl, FaQuestionCircle } from "react-icons/fa";
import { useAiData } from "./useAiData";

const AiData = ({ show, onClose, lecture, onGenerate, onDelete }) => {
  const { state, data, handlers } = useAiData(lecture, show);

  // if no lecture selected, don't render anything
  if (!lecture) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      <ModalHeader className="bg-purple">
        <div className="d-flex flex-column">
          <h5 className="modal-title text-white">
            AI Generated Content
          </h5>
          <div className="text-white">{data.title}</div>
        </div>
        <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" onClick={onClose}><BsXLg /></button>
      </ModalHeader>

      <ModalBody className="p-1">
        {/* State 1: Processing */}
        {state.isProcessing && (
          <div className="text-center py-5">
            <div className="spinner-border text-purple mb-3" role="status"></div>
            <h5 className="mb-0">Generating content...</h5>
            <p className="mb-0">This may take a minute. You can close this window, it will continue in the background.</p>
          </div>
        )}

        {/* State 2: Failed */}
        {state.isFailed && (
          <Alert variant="danger" className="m-2">
            <h6 className="alert-heading mb-0">Generation Failed</h6>
            <p className="mb-0">Something went wrong while processing the video. Please try again.</p>
          </Alert>
        )}

        {/* State 3: Empty */}
        {!state.isProcessing && !state.hasData && !state.isFailed && (
          <div className="text-center py-5">
            <FaRobot size={40} className="text-muted mb-2 opacity-50" />
            <h5 className="mb-0">No AI Content Yet</h5>
            <p className="mb-2">Generate a summary, key concepts, and quizzes automatically from your video.</p>
            <Button variant="purple" onClick={onGenerate}>
              <FaRobot className="me-2" /> Generate Now
            </Button>
          </div>
        )}

        {/* State 4: Data Display */}
        {state.hasData && (
          <Tab.Container activeKey={state.activeTab} onSelect={handlers.setActiveTab}>
            <Nav variant="tabs" className="mb-2">
              <Nav.Item>
                <Nav.Link eventKey="summary" className="d-flex align-items-center">
                  <FaListUl className="me-2" /> Summary
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="concepts" className="d-flex align-items-center">
                  <FaLightbulb className="me-2" /> Concepts
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="quiz" className="d-flex align-items-center">
                  <FaQuestionCircle className="me-2" /> Quiz <Badge bg="secondary" className="ms-2">{data.quizzes.length}</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* TAB: Summary */}
              <Tab.Pane eventKey="summary">
                <div className="p-2">
                  <h6>Video Summary</h6>
                  <p className="mb-0">{data.summary}</p>

                  {data.mainPoints.length > 0 && (
                    <>
                      <h6 className="mt-3">Main Takeaways</h6>
                      <ul className="list-group list-group-flush">
                        {data.mainPoints.map((point, idx) => (
                          <li key={idx} className="list-group-item bg-transparent px-0 py-2 d-flex">
                            <FaCheckCircle className="text-purple mt-1 me-2 flex-shrink-0" size={14} />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </Tab.Pane>

              {/* TAB: Key Concepts */}
              <Tab.Pane eventKey="concepts">
                <div className="row g-2 p-2">
                  {data.keyConcepts.length === 0 && <p className="text-muted">No key concepts identified.</p>}
                  {data.keyConcepts.map((item, idx) => (
                    <div key={idx} className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title text-purple fw-bold mb-1">{item.term}</h6>
                          <p className="card-text mb-0">{item.definition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>

              {/* TAB: Quiz */}
              <Tab.Pane eventKey="quiz">
                <Accordion defaultActiveKey="0" className="p-2">
                  {data.quizzes.length === 0 && <p className="text-center">No quizzes generated.</p>}
                  {data.quizzes.map((q, idx) => (
                    <Accordion.Item eventKey={String(idx)} key={idx}>
                      <Accordion.Header>
                        <span className="fw-bold me-2">Q{idx + 1}.</span> {q.question}
                      </Accordion.Header>
                      <Accordion.Body className="p-2">
                        <div className="mb-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`p-2 border rounded mb-2 ${opt === q.correctAnswer ? "bg-success-soft border-success" : "bg-body"}`}>
                              {opt === q.correctAnswer && <FaCheckCircle className="text-success mb-1 me-2" />}
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="p-2 rounded border border-purple bg-purple bg-opacity-10">
                          <strong>Explanation: </strong> {q.explanation}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        )}
      </ModalBody>

      <ModalFooter className="justify-content-between">
        <Button variant="outline-secondary" className="mb-0" onClick={onClose}>Close</Button>

        {/* Action Buttons (shown if have data or generating data failed) */}
        {(state.hasData || state.isFailed) && (
          <div>
            <Button variant="danger-soft" className="me-2 mb-0" onClick={onDelete}>
              <FaTrash className="me-1" /> Delete Data
            </Button>
            <Button variant="purple-soft" className="mb-0" onClick={onGenerate}>
              <FaRedo className="me-1" /> Regenerate
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default AiData;