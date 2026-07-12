import { Spinner } from "react-bootstrap";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import QuizOverlay from "./QuizOverlay";

const PLYR_OPTIONS = {
  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
  seekTime: 5,
};

const VideoScreen = ({
  playerContainerRef,
  source,
  playerKey,
  loading,
  error,
  streamLoading,
  streamError,
  hasCourse,
  hasLecture,
  activeQuiz,
  quizTotal,
  onQuizAnswer,
  onQuizContinue,
}) => {
  const renderOverlay = () => {
    if (loading || streamLoading) {
      return (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
          <Spinner animation="border" variant="light" />
        </div>
      );
    }
    if (error || streamError) {
      return (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-danger">
          {String(error || streamError)}
        </div>
      );
    }
    if (!hasCourse) return <div className="text-white center-absolute">No Course Found</div>;
    if (!hasLecture || !source) return <div className="text-white center-absolute">No Video Source</div>;
    return null;
  };

  return (
    <div className="overflow-hidden fullscreen-video position-relative p-1">
      <div className="video-player" ref={playerContainerRef}>
        {source && (
          <Plyr
            key={playerKey}
            playsInline
            crossOrigin="anonymous"
            controls
            source={source}
            options={PLYR_OPTIONS}
          />
        )}
      </div>
      {renderOverlay()}
      {activeQuiz && (
        <QuizOverlay
          key={activeQuiz.index}
          quiz={activeQuiz.quiz}
          index={activeQuiz.index}
          displayNumber={activeQuiz.seq}
          total={quizTotal}
          onAnswer={onQuizAnswer}
          onContinue={onQuizContinue}
        />
      )}
    </div>
  );
};

export default VideoScreen;