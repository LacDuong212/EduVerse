import { useState } from "react";
import { Collapse } from "react-bootstrap";
import Playlist from "./Playlist";
import NoteSidebar from "./notes/NoteSidebar";
import useToggle from "@/hooks/useToggle";

export default function CoursePlaylistSidebar({
  course,
  currentLectureId,
  lectureProgressMap = {},
  onSelectLecture,
  courseId,
  lectureTitle,
  seekTo,
  getCurrentTime,
  notesApi,
}) {
  const { isTrue: isOpen, toggle } = useToggle(true);
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div
      className="flex-shrink-0 border-start position-relative h-100"
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

      <Collapse className="collapse-horizontal h-100 bg-light" in={isOpen} dimension="width">
        <div className="d-flex flex-column h-100 w-280px w-sm-400px">
          {/* Tab bar */}
          <div className="d-flex border-bottom flex-shrink-0">
            <button
              className={`flex-fill border-0 bg-transparent py-2 px-3 small fw-semibold ${
                activeTab === "content" ? "text-primary" : "text-body opacity-50"
              }`}
              style={{ borderBottom: activeTab === "content" ? "2px solid" : "none" }}
              onClick={() => setActiveTab("content")}
            >
              Course Content
            </button>
            <button
              className={`flex-fill border-0 bg-transparent py-2 px-3 small fw-semibold ${
                activeTab === "notes" ? "text-primary" : "text-body opacity-50"
              }`}
              style={{ borderBottom: activeTab === "notes" ? "2px solid currentColor" : "none" }}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          <div className="flex-grow-1 overflow-hidden">
            {activeTab === "content" ? (
              <Playlist
                course={course}
                currentId={currentLectureId}
                lectureProgress={lectureProgressMap}
                onSelect={onSelectLecture}
              />
            ) : (
              <NoteSidebar
                notesApi={notesApi}
                lectureId={currentLectureId}
                lectureTitle={lectureTitle}
                courseTitle={course?.title}
                getCurrentTime={getCurrentTime}
                onSeek={seekTo}
                onNavigateToLecture={onSelectLecture}
                course={course}
              />
            )}
          </div>
        </div>
      </Collapse>
    </div>
  );
}
