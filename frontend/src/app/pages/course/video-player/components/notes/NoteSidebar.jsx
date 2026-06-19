import { useState, useEffect, useRef, useMemo } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { BsPlus, BsDownload, BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
import NoteItem from "./NoteItem";
import TagInput from "./TagInput";
import { exportNotesToPDF } from "../../utils/exportNotes";
import QnaModal from "@/app/student/learning/components/QnaModal";

const formatTimestamp = (seconds) => {
  const t = Math.max(0, Math.floor(seconds));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function NoteSidebar({
  notesApi,
  lectureId,
  lectureTitle,
  courseTitle,
  getCurrentTime,
  onSeek,
  onNavigateToLecture,
  course,
}) {
  const {
    notes,
    loading,
    submitting,
    addNote,
    editNote,
    removeNote,
    courseNotes,
    courseNotesLoading,
    fetchCourseNotes,
  } = notesApi;

  // --- scope / search ---
  const [scope, setScope] = useState("lecture");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQna, setShowQna] = useState(false);

  // --- compose ---
  const [composing, setComposing] = useState(false);
  const [composeTs, setComposeTs] = useState(0);
  const [composeContent, setComposeContent] = useState("");
  const [composeTags, setComposeTags] = useState([]);

  // --- active note highlight ---
  const [activeNoteId, setActiveNoteId] = useState(null);
  const activeNoteIdRef = useRef(null);

  // Reset state when lecture changes
  useEffect(() => {
    setScope("lecture");
    setSearchQuery("");
    setComposing(false);
    setComposeTags([]);
  }, [lectureId]);

  // Active note interval (lecture scope only)
  useEffect(() => {
    if (!notes.length) return;
    const interval = setInterval(() => {
      const t = getCurrentTime?.() ?? 0;
      // Notes are sorted descending — first match is the highest timestamp <= t
      let active = null;
      for (const n of notes) {
        if (n.timestamp <= t) { active = n.id; break; }
      }
      if (active !== activeNoteIdRef.current) {
        activeNoteIdRef.current = active;
        setActiveNoteId(active);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [notes, getCurrentTime]);

  // Lecture map: lectureId → title (for "all" scope grouping)
  const lectureMap = useMemo(() => {
    const map = {};
    for (const sec of course?.curriculum?.sections || []) {
      for (const lec of sec.lectures || []) {
        map[lec.lecId] = lec.title;
      }
    }
    return map;
  }, [course]);

  // Switch to "all" scope — fetch course notes on first open
  const handleScopeAll = () => {
    setScope("all");
    if (!courseNotes.length && !courseNotesLoading) {
      fetchCourseNotes();
    }
  };

  // Compose handlers
  const handleStartCompose = () => {
    setComposeTs(getCurrentTime?.() ?? 0);
    setComposeContent("");
    setComposeTags([]);
    setComposing(true);
  };

  const handleSubmitNote = async () => {
    if (!composeContent.trim()) return;
    const created = await addNote({
      timestamp: composeTs,
      content: composeContent.trim(),
      tags: composeTags,
    });
    if (created) {
      setComposing(false);
      setComposeContent("");
      setComposeTags([]);
    }
  };

  // Filter notes
  const isAll = scope === "all";
  const displayNotes = isAll ? courseNotes : notes;

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return displayNotes;
    const q = searchQuery.toLowerCase();
    return displayNotes.filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [displayNotes, searchQuery]);

  // Group by lectureId for "all" scope
  const groupedNotes = useMemo(() => {
    if (!isAll) return null;
    const groups = {};
    for (const note of filteredNotes) {
      if (!groups[note.lectureId]) groups[note.lectureId] = [];
      groups[note.lectureId].push(note);
    }
    return groups;
  }, [isAll, filteredNotes]);

  // Export
  const handleExport = () => {
    exportNotesToPDF({
      notes: isAll ? courseNotes : notes,
      lectureTitle: isAll ? null : lectureTitle,
      courseTitle,
    });
  };

  const showSearch = isAll || notes.length > 3;
  const hasExportable = isAll ? courseNotes.length > 0 : notes.length > 0;

  return (
    <div className="d-flex flex-column h-100">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-3 pt-2 border-bottom">
        <div className="d-flex align-items-center justify-content-between mb-2">
          {/* Scope tabs */}
          <div className="d-flex gap-1">
            <button
              className={`btn btn-sm py-0 px-2 ${!isAll ? "btn-primary" : "btn-light text-body"}`}
              style={{ fontSize: 12 }}
              onClick={() => setScope("lecture")}
            >
              This Lecture{notes.length > 0 ? ` (${notes.length})` : ""}
            </button>
            <button
              className={`btn btn-sm py-0 px-2 ${isAll ? "btn-primary" : "btn-light text-body"}`}
              style={{ fontSize: 12 }}
              onClick={handleScopeAll}
            >
              All{courseNotes.length > 0 ? ` (${courseNotes.length})` : ""}
            </button>
          </div>

          {/* Actions */}
          <div className="d-flex gap-1">
            {hasExportable && (
              <Button
                size="sm"
                variant="light"
                className="d-flex align-items-center py-0 text-body"
                style={{ lineHeight: "24px" }}
                title="Export notes as PDF"
                onClick={handleExport}
              >
                <BsDownload size={13} />
              </Button>
            )}
            {!isAll && (
              <Button
                size="sm"
                variant="outline-primary"
                className="d-flex align-items-center gap-1 py-0"
                style={{ lineHeight: "24px" }}
                onClick={handleStartCompose}
                disabled={composing}
              >
                <BsPlus size={16} /> Add
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="mb-2 position-relative">
            <BsSearch
              size={12}
              className="position-absolute text-body opacity-50"
              style={{ top: "50%", left: 10, transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 28 }}
            />
          </div>
        )}
      </div>

      {/* ── Compose area (lecture scope only) ── */}
      {composing && !isAll && (
        <div className="px-3 py-2 border-bottom bg-light flex-shrink-0">
          <div className="mb-2">
            <span className="badge bg-primary text-white fw-semibold" style={{ fontSize: 11 }}>
              @ {formatTimestamp(composeTs)}
            </span>
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            size="sm"
            placeholder="Write your note…"
            value={composeContent}
            onChange={(e) => setComposeContent(e.target.value)}
            maxLength={5000}
            autoFocus
          />
          <div className="mt-2">
            <TagInput tags={composeTags} onChange={setComposeTags} />
          </div>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span className="text-body opacity-50" style={{ fontSize: 11 }}>
              {composeContent.length} / 5000
            </span>
            <div className="d-flex gap-2">
              <Button size="sm" variant="light" onClick={() => setComposing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmitNote}
                disabled={submitting || !composeContent.trim()}
              >
                {submitting ? <Spinner size="sm" animation="border" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notes list ── */}
      <div className="flex-grow-1 overflow-auto px-3 py-2">

        {/* Lecture scope */}
        {!isAll && (
          loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-5 text-body opacity-50">
              {searchQuery ? (
                <p className="small mb-0">No notes match &ldquo;{searchQuery}&rdquo;</p>
              ) : (
                <>
                  <p className="small mb-1">No notes yet.</p>
                  <p className="small mb-0">Click <strong>Add</strong> to capture a moment.</p>
                </>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                onSeek={onSeek}
                onEdit={editNote}
                onDelete={removeNote}
                submitting={submitting}
              />
            ))
          )
        )}

        {/* All scope */}
        {isAll && (
          courseNotesLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-5 text-body opacity-50">
              {searchQuery ? (
                <p className="small mb-0">No notes match &ldquo;{searchQuery}&rdquo;</p>
              ) : (
                <p className="small mb-0">No notes in this course yet.</p>
              )}
            </div>
          ) : (
            Object.entries(groupedNotes || {}).map(([lecId, lecNotes]) => {
              const lecTitle = lectureMap[lecId] || `Lecture ${lecId.slice(-6)}`;
              const isCurrent = lecId === lectureId;
              return (
                <div key={lecId} className="mb-3">
                  {/* Lecture group header */}
                  <div
                    className={`d-flex align-items-center gap-1 mb-2 py-1 border-bottom small fw-semibold ${
                      isCurrent ? "text-primary" : "text-body"
                    }`}
                  >
                    <span className="text-truncate flex-grow-1">{lecTitle}</span>
                    <span className="opacity-50 flex-shrink-0">({lecNotes.length})</span>
                    {!isCurrent && (
                      <button
                        className="btn btn-link btn-sm p-0 ms-1 flex-shrink-0 text-body opacity-50"
                        style={{ fontSize: 11 }}
                        onClick={() => onNavigateToLecture?.({ lecId })}
                        title="Go to this lecture"
                      >
                        Go →
                      </button>
                    )}
                  </div>
                  {lecNotes.map((note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isActive={isCurrent && note.id === activeNoteId}
                      onSeek={
                        isCurrent
                          ? onSeek
                          : () => onNavigateToLecture?.({ lecId })
                      }
                      onEdit={editNote}
                      onDelete={removeNote}
                      submitting={submitting}
                    />
                  ))}
                </div>
              );
            })
          )
        )}
      </div>

      {/* ── Pinned footer — same as Course Content sidebar ── */}
      <div className="flex-shrink-0 border-top px-3 py-2">
        <div className="d-grid gap-2">
          <Button
            variant="outline-primary"
            className="mb-0"
            onClick={() => setShowQna(true)}
          >
            Q&amp;A
          </Button>
          <Link
            to={`/student/courses/${course?.courseId || ""}`}
            className="btn btn-primary-soft mb-0"
          >
            Back to Learning Course
          </Link>
        </div>
      </div>

      {showQna && (
        <QnaModal
          show={showQna}
          onHide={() => setShowQna(false)}
          lectureId={lectureId}
          lectureTitle={lectureTitle}
        />
      )}
    </div>
  );
}
