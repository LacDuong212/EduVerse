import { Collapse } from "react-bootstrap";
import Playlist from "./Playlist";
import useToggle from "@/hooks/useToggle";

const CoursePlaylistSidebar = ({ course, currentLectureId, lectureProgressMap, onSelectLecture }) => {
  const { isTrue: isOpen, toggle } = useToggle(true);

  return (
    <div className="justify-content-end position-relative">
      <button
        onClick={toggle}
        className="navbar-toggler btn btn-white mt-4 plyr-toggler"
        type="button"
        aria-expanded={isOpen}
      >
        <span className="navbar-toggler-animation">
          <span />
          <span />
          <span />
        </span>
      </button>

      <Collapse className="collapse-horizontal" in={isOpen} dimension="width">
        <div style={{ width: '350px', maxWidth: '100vw' }}> {/* Set width cứng hoặc class css */}
          <Playlist
            course={course}
            onSelect={onSelectLecture}
            currentId={currentLectureId}
            lectureProgress={lectureProgressMap}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default CoursePlaylistSidebar;