import { useState, useEffect } from 'react';
import { Modal, Button, Card, Alert, CardHeader, CardBody, CardTitle } from 'react-bootstrap';
import { BsCheckCircleFill, BsXCircleFill, BsLightbulb, BsJournalText, BsQuestionCircle } from 'react-icons/bs';

export default function LectureConclusionModal({ show, onHide, aiData, onNext }) {
  const { summary, quizzes } = aiData || {};
  
  const [userAnswers, setUserAnswers] = useState({});
  const [checkedState, setCheckedState] = useState({});

  useEffect(() => {
    if (show) {
      setUserAnswers({});
      setCheckedState({});
    }
  }, [show, aiData]);

  const handleSelect = (qIndex, optIndex) => {
    if (checkedState[qIndex]) return; 
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleCheck = (qIndex) => {
    setCheckedState(prev => ({ ...prev, [qIndex]: true }));
  };

  const hasContent = summary || (quizzes && quizzes.length > 0);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable backdrop="static">
      <Modal.Header closeButton className="bg-light border-bottom px-4">
        <Modal.Title className="h5 text-primary">
          🎉 Congratulations on completing the lesson!
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4 bg-light bg-opacity-10">
        {!hasContent && <p className="text-center">The lesson is over. You can move on to the next one.</p>}

        {/* Summary */}
        {summary && (
          <Card className="border rounded-3 mb-4">
            <CardHeader className="bg-light border-bottom">
              <CardTitle as="h5" className="mb-0 d-flex align-items-center">
                <BsJournalText className="me-2 text-warning" /> 
                Lesson Summary
              </CardTitle>
            </CardHeader>
            <CardBody style={{ textAlign: 'justify' }}>
              {summary}
            </CardBody>
          </Card>
        )}

        {/* Quiz */}
        {quizzes && quizzes.length > 0 && (
          <div>
            <div className="d-flex align-items-center mb-3 mt-2">
               <BsQuestionCircle className="me-2 text-info fs-5" /> 
               <h5 className="mb-0">Quick Knowledge Check</h5>
            </div>
            
            {quizzes.map((quiz, qIndex) => {
              const isChecked = checkedState[qIndex];
              const selected = userAnswers[qIndex];
              const isCorrect = quiz.options[selected] === quiz.correctAnswer; 

              return (
                <Card key={qIndex} className="border rounded-3 mb-4">
                  <CardHeader className="bg-light border-bottom">
                     <h6 className="mb-0">
                       <span className="fw-bold me-2">Question {qIndex + 1}:</span> 
                       {quiz.question}
                     </h6>
                  </CardHeader>

                  <CardBody>
                    <div className="vstack gap-2">
                      {quiz.options.map((opt, oIndex) => {
                        let labelClass = "btn w-100 text-start d-flex justify-content-between align-items-center text-wrap h-auto";
                        let icon = null;

                        if (isChecked) {
                          if (opt === quiz.correctAnswer) {
                            labelClass += " btn-success";
                            icon = <BsCheckCircleFill className="ms-2" />;
                          } else if (selected === oIndex && opt !== quiz.correctAnswer) {
                            labelClass += " btn-danger";
                            icon = <BsXCircleFill className="ms-2" />;
                          } else {
                            labelClass += " btn-light text-muted opacity-50";
                          }
                        } else {
                          if (selected === oIndex) {
                            labelClass += " btn-primary";
                          } else {
                            labelClass += " btn-outline-primary";
                          }
                        }

                        const inputId = `quiz-${qIndex}-opt-${oIndex}`;

                        return (
                          <div key={oIndex}>
                            <input 
                              type="radio" 
                              className="btn-check" 
                              name={`quiz-${qIndex}`} 
                              id={inputId} 
                              checked={selected === oIndex}
                              onChange={() => handleSelect(qIndex, oIndex)}
                              disabled={isChecked}
                            />
                            <label className={labelClass} htmlFor={inputId}>
                              <span>{opt}</span>
                              {icon}
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action & Explanation Area */}
                    <div className="mt-3">
                      {isChecked && quiz.explanation && (
                        <Alert variant="info" className="mb-2">
                          <BsLightbulb className="me-2" /> 
                          <strong>Explanation:</strong> {quiz.explanation}
                        </Alert>
                      )}
                      
                      {!isChecked && (
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="primary"
                            className="next-btn mb-0"
                            disabled={selected === undefined} 
                            onClick={() => handleCheck(qIndex)}
                          >
                            Check Answer
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onHide}>Close</Button>
        {onNext && (
          <Button variant="primary" onClick={onNext}>
            Next Lecture <i className="fas fa-arrow-right ms-1"></i>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}