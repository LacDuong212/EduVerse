import { Collapse } from "react-bootstrap";
import Playlist from "./Playlist";
import useToggle from "@/hooks/useToggle";

export default function CoursePlaylistSidebar({
  course,
  currentLectureId,
  lectureProgressMap = {},
  onSelectLecture,
}) {
  const { isTrue: isOpen, toggle } = useToggle(true);

  return (
    <div
      className="flex-shrink-0 border-start bg-white position-relative"
      style={{ zIndex: 10 }}
    >
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
        <div style={{ width: 400, maxWidth: "100vw" }}>
          <Playlist
            course={course}
            currentId={currentLectureId}
            lectureProgress={lectureProgressMap}
            onSelect={onSelectLecture}
          />
        </div>
      </Collapse>
    </div>
  );
}