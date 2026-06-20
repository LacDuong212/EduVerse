import { useMemo, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { BsDownload, BsSearch } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import NoteItem from "@/app/pages/course/video-player/components/notes/NoteItem";
import { exportNotesToPDF } from "@/app/pages/course/video-player/utils/exportNotes";
import useCourseNotes from "../hooks/useCourseNotes";

export default function NotesTab({ sections = [], courseTitle }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { notes, loading, submitting, editNote, removeNote } = useCourseNotes(courseId);
  const [searchQuery, setSearchQuery] = useState("");

  // lectureId → { title, sectionTitle }
  const lectureMap = useMemo(() => {
    const map = {};
    for (const sec of sections) {
      for (const lec of sec.lectures || []) {
        map[lec.lecId] = { title: lec.title, sectionTitle: sec.title };
      }
    }
    return map;
  }, [sections]);

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  // Group filtered notes by lectureId
  const groupedNotes = useMemo(() => {
    const groups = {};
    for (const note of filteredNotes) {
      if (!groups[note.lectureId]) groups[note.lectureId] = [];
      groups[note.lectureId].push(note);
    }
    return groups;
  }, [filteredNotes]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-5 text-body opacity-50">
        <p className="mb-1">No notes yet.</p>
        <p className="small mb-0">
          Open a lecture in the video player and click <strong>Add</strong> to capture notes while watching.
        </p>
      </div>
    );
  }

  return (
    <div className="vstack gap-3">
      {/* Header: count + search + export */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span className="small fw-semibold text-body opacity-50">
          {notes.length} note{notes.length !== 1 ? "s" : ""} across this course
        </span>
        <div className="ms-auto d-flex align-items-center gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            className="d-flex align-items-center gap-1"
            onClick={() =>
              exportNotesToPDF({ notes, lectureTitle: null, courseTitle })
            }
            title="Export all notes as PDF"
          >
            <BsDownload size={13} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="position-relative" style={{ maxWidth: 340 }}>
        <BsSearch
          size={13}
          className="position-absolute text-body opacity-50"
          style={{ top: "50%", left: 10, transform: "translateY(-50%)", pointerEvents: "none" }}
        />
        <Form.Control
          size="sm"
          type="text"
          placeholder="Search notes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 30 }}
        />
      </div>

      {/* No search results */}
      {filteredNotes.length === 0 && (
        <p className="text-body opacity-50 text-center py-3 mb-0">
          No notes match &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {/* Grouped notes */}
      {Object.entries(groupedNotes).map(([lecId, lecNotes]) => {
        const info = lectureMap[lecId];
        const lecTitle = info?.title || `Lecture ${lecId.slice(-6)}`;
        const secTitle = info?.sectionTitle;

        return (
          <div key={lecId}>
            {/* Lecture group header */}
            <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom">
              <div className="flex-grow-1 min-w-0">
                {secTitle && (
                  <p className="mb-0 small text-body opacity-50 text-truncate">{secTitle}</p>
                )}
                <p className="mb-0 fw-semibold small text-truncate">{lecTitle}</p>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className="small text-body opacity-50">
                  {lecNotes.length} note{lecNotes.length !== 1 ? "s" : ""}
                </span>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="py-0 px-2"
                  style={{ fontSize: 12, lineHeight: "22px" }}
                  onClick={() =>
                    navigate(`/student/courses/${courseId}/watch/${lecId}`)
                  }
                >
                  Watch →
                </Button>
              </div>
            </div>

            {/* Note items */}
            <div className="ms-2">
              {lecNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={false}
                  onSeek={() =>
                    navigate(`/student/courses/${courseId}/watch/${lecId}`)
                  }
                  onEdit={editNote}
                  onDelete={removeNote}
                  submitting={submitting}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
