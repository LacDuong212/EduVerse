import { Spinner } from "react-bootstrap";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

const VideoScreen = ({ 
  playerContainerRef, 
  source, 
  playerKey, 
  loading, 
  error, 
  streamLoading, 
  streamError, 
  hasCourse,
  hasLecture 
}) => {
  
  // Logic hiển thị overlay thông báo
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
    <div className="overflow-hidden fullscreen-video w-100 position-relative bg-black">
      {/* Container có ref để tracking hook truy cập <video> */}
      <div className="video-player rounded-3" ref={playerContainerRef}>
        {source && (
          <Plyr
            key={playerKey}
            playsInline
            crossOrigin="anonymous"
            controls
            source={source}
          />
        )}
      </div>
      {renderOverlay()}
    </div>
  );
};

export default VideoScreen;