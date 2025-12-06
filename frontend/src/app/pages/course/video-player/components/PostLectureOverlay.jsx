import React, { useState } from 'react';
import { Button, Card, ProgressBar, Badge, Tab, Tabs, Alert } from 'react-bootstrap';
import { FaRedo, FaStepForward, FaCheckCircle, FaTimesCircle, FaCheck, FaTimes } from 'react-icons/fa';

const PostLectureOverlay = ({ aiData, onReplay, onNext }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Quiz States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Lưu danh sách câu trả lời của user: [{ questionIdx, selectedOption, isCorrect }]
  const [userAnswers, setUserAnswers] = useState([]); 
  const [selectedOption, setSelectedOption] = useState(null); // Option đang chọn hiện tại (để highlight)

  // Validate Data
  if (!aiData || aiData.status !== 'Completed' || !aiData.quizzes) {
    return (
      <div className="text-center text-white p-5">
        <h3>Bài học đã kết thúc!</h3>
        <p>Dữ liệu AI chưa sẵn sàng.</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button variant="outline-light" onClick={onReplay}><FaRedo /> Xem lại</Button>
          <Button variant="primary" onClick={onNext}><FaStepForward /> Bài tiếp theo</Button>
        </div>
      </div>
    );
  }

  const currentQuiz = aiData.quizzes[currentQuestionIdx];

  // Xử lý khi chọn đáp án
  const handleAnswer = (option) => {
    setSelectedOption(option);
    
    const isCorrect = option === currentQuiz.correctAnswer;
    
    // Lưu kết quả vào mảng tạm thời (chưa update state userAnswers ngay để tránh render lại list review)
    // Ta sẽ update userAnswers khi chuyển câu hoặc kết thúc
  };

  // Chuyển câu hỏi hoặc kết thúc
  const handleNextQuestion = () => {
    const isCorrect = selectedOption === currentQuiz.correctAnswer;
    
    // Lưu lịch sử trả lời
    const newAnswerRecord = {
        question: currentQuiz.question,
        options: currentQuiz.options,
        selected: selectedOption,
        correct: currentQuiz.correctAnswer,
        explanation: currentQuiz.explanation,
        isCorrect: isCorrect
    };

    const updatedAnswers = [...userAnswers, newAnswerRecord];
    setUserAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentQuestionIdx < aiData.quizzes.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
        setShowResult(true);
    }
  };

  // Tính điểm dựa trên mảng userAnswers
  const calculateScore = () => {
    return userAnswers.filter(a => a.isCorrect).length;
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIdx(0);
    setUserAnswers([]);
    setShowResult(false);
    setSelectedOption(null);
  };

  return (
    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, backdropFilter: 'blur(5px)' }}>
      <Card className="w-75 h-75 shadow-lg border-0 overflow-hidden" style={{ maxWidth: '900px' }}>
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 text-primary fw-bold">
                {showResult ? "Kết quả bài học" : "Ôn tập kiến thức"}
            </h5>
            <div>
                <Button variant="link" className="text-secondary text-decoration-none p-0 me-3 fw-medium" onClick={onReplay}>
                    <FaRedo className="me-1"/> Xem lại Video
                </Button>
                <Button variant="primary" size="sm" onClick={onNext}>
                    Bài tiếp theo <FaStepForward className="ms-1"/>
                </Button>
            </div>
        </Card.Header>
        
        <Card.Body className="overflow-auto custom-scrollbar bg-light">
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 nav-pills nav-fill bg-white p-2 rounded shadow-sm">
                <Tab eventKey="summary" title="Tóm tắt nội dung (AI)">
                    <div className="p-3 bg-white rounded shadow-sm mt-3">
                        <div dangerouslySetInnerHTML={{ __html: aiData.summary ? aiData.summary.replace(/\n/g, '<br />') : 'Không có tóm tắt.' }} className="text-dark lh-lg" />
                    </div>
                </Tab>
                
                <Tab eventKey="quiz" title={`Trắc nghiệm nhanh (${aiData.quizzes.length})`}>
                    <div className="mt-3">
                        {/* 1. Màn hình Chào mừng */}
                        {!quizStarted && !showResult && (
                            <div className="text-center py-5 bg-white rounded shadow-sm">
                                <div className="mb-4">
                                    <img src="https://cdn-icons-png.flaticon.com/512/3407/3407024.png" alt="quiz" width="80" className="mb-3"/>
                                    <h4>Sẵn sàng kiểm tra?</h4>
                                    <p className="text-muted">Bạn có {aiData.quizzes.length} câu hỏi để ôn tập.</p>
                                </div>
                                <Button variant="success" size="lg" className="px-5 rounded-pill" onClick={() => setQuizStarted(true)}>
                                    Bắt đầu ngay
                                </Button>
                            </div>
                        )}

                        {/* 2. Màn hình Làm bài */}
                        {quizStarted && !showResult && (
                            <div className="p-4 bg-white rounded shadow-sm">
                                <div className="d-flex justify-content-between mb-2 text-muted small">
                                    <span>Câu hỏi {currentQuestionIdx + 1} / {aiData.quizzes.length}</span>
                                    <span>Tiến độ</span>
                                </div>
                                <ProgressBar variant="success" now={((currentQuestionIdx + 1) / aiData.quizzes.length) * 100} className="mb-4" style={{height: '6px'}} />
                                
                                <h5 className="mb-4 fw-bold text-dark">{currentQuiz.question}</h5>
                                
                                <div className="d-grid gap-3">
                                    {currentQuiz.options.map((opt, idx) => {
                                        const isSelected = selectedOption === opt;
                                        // Logic hiển thị màu khi đã chọn (Instant Feedback)
                                        let variant = "outline-secondary";
                                        let icon = null;

                                        if (selectedOption) {
                                            if (opt === currentQuiz.correctAnswer) {
                                                variant = "success"; // Luôn hiện màu xanh cho đáp án đúng
                                                icon = <FaCheckCircle className="float-end mt-1"/>;
                                            } else if (isSelected) {
                                                variant = "danger"; // Hiện màu đỏ nếu chọn sai
                                                icon = <FaTimesCircle className="float-end mt-1"/>;
                                            } else {
                                                variant = "light text-muted border"; // Làm mờ các đáp án khác
                                            }
                                        }

                                        return (
                                            <Button 
                                                key={idx} 
                                                variant={variant}
                                                className={`text-start p-3 position-relative fw-medium ${selectedOption && !isSelected && opt !== currentQuiz.correctAnswer ? 'opacity-50' : ''}`}
                                                onClick={() => !selectedOption && handleAnswer(opt)}
                                                disabled={!!selectedOption} // Disable sau khi chọn
                                            >
                                                {opt}
                                                {icon}
                                            </Button>
                                        )
                                    })}
                                </div>

                                {/* Khu vực hiển thị giải thích và nút Next sau khi chọn */}
                                {selectedOption && (
                                    <div className="mt-4 animate__animated animate__fadeIn">
                                        <Alert variant={selectedOption === currentQuiz.correctAnswer ? "success" : "danger"}>
                                            <strong>{selectedOption === currentQuiz.correctAnswer ? "Chính xác!" : "Chưa đúng!"}</strong>
                                            <div className="mt-1 small">{currentQuiz.explanation}</div>
                                        </Alert>
                                        <div className="d-flex justify-content-end">
                                            <Button variant="primary" onClick={handleNextQuestion}>
                                                {currentQuestionIdx < aiData.quizzes.length - 1 ? "Câu tiếp theo" : "Xem kết quả"} <FaStepForward />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Màn hình Kết quả & Review (PHẦN QUAN TRỌNG ĐƯỢC THÊM VÀO) */}
                        {showResult && (
                            <div className="bg-white rounded shadow-sm">
                                {/* Header Kết quả */}
                                <div className="text-center py-4 border-bottom bg-light rounded-top">
                                    <h4 className="text-muted">Tổng điểm của bạn</h4>
                                    <div className={`display-3 fw-bold my-2 ${calculateScore() === aiData.quizzes.length ? 'text-success' : 'text-primary'}`}>
                                        {calculateScore()} <span className="fs-4 text-muted">/ {aiData.quizzes.length}</span>
                                    </div>
                                    <p className="mb-3">
                                        {calculateScore() === aiData.quizzes.length 
                                            ? "🎉 Xuất sắc! Bạn đã nắm vững toàn bộ kiến thức." 
                                            : "💪 Hãy xem lại các câu sai bên dưới để củng cố kiến thức nhé."}
                                    </p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={resetQuiz}>Làm lại Quiz</Button>
                                        <Button variant="success" size="sm" onClick={onNext}>Học bài tiếp theo</Button>
                                    </div>
                                </div>

                                {/* Danh sách chi tiết (Review Mode) */}
                                <div className="p-4">
                                    <h5 className="mb-3 fw-bold border-start border-4 border-primary ps-2">Chi tiết đáp án</h5>
                                    <div className="d-flex flex-column gap-3">
                                        {userAnswers.map((item, index) => (
                                            <div key={index} className={`border rounded p-3 ${item.isCorrect ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10'}`}>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="fw-bold">Câu {index + 1}: {item.question}</span>
                                                    {item.isCorrect 
                                                        ? <Badge bg="success"><FaCheck /> Đúng</Badge> 
                                                        : <Badge bg="danger"><FaTimes /> Sai</Badge>
                                                    }
                                                </div>
                                                
                                                {/* Đáp án người dùng chọn */}
                                                <div className="mb-1">
                                                    <span className="text-muted small">Bạn chọn:</span> <br/>
                                                    <span className={item.isCorrect ? "fw-bold text-success" : "fw-bold text-danger"}>
                                                        {item.selected}
                                                    </span>
                                                </div>

                                                {/* Đáp án đúng (chỉ hiện khi sai) */}
                                                {!item.isCorrect && (
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Đáp án đúng:</span> <br/>
                                                        <span className="fw-bold text-success">{item.correct}</span>
                                                    </div>
                                                )}

                                                {/* Giải thích */}
                                                <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 small text-dark">
                                                    <strong>💡 Giải thích: </strong> {item.explanation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Tab>
            </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PostLectureOverlay;