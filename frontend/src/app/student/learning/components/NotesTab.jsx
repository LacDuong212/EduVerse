import NoteItem from "@/app/pages/course/video-player/components/notes/NoteItem";
import { exportNotesToPDF } from "@/app/pages/course/video-player/utils/exportNotes";
import { useMemo, useState } from "react";
import { Button, Card, Col, Form, ListGroup, Row, Spinner } from "react-bootstrap";
import { BsArrowRightShort, BsDownload, BsJournalText, BsSearch } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import useCourseNotes from "../hooks/useCourseNotes";
import { FaPlay } from "react-icons/fa";

export default function NotesTab({ sections = [], courseTitle }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { notes, loading, submitting, editNote, removeNote } = useCourseNotes(courseId);
  const [searchQuery, setSearchQuery] = useState("");

  const lectureMap = useMemo(() => {
    const map = {};
    for (const sec of sections) {
      for (const lec of sec.lectures || []) {
        map[lec.lecId] = { title: lec.title, sectionTitle: sec.title };
      }
    }
    return map;
  }, [sections]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

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
        <Spinner animation="border" variant="primary" size="md" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="border-0 shadow-sm text-center py-5 px-3 bg-light-subtle rounded-3 mt-2">
        <Card.Body>
          <div className="text-secondary mb-3">
            <BsJournalText size={42} className="opacity-50" />
          </div>
          <h5 className="fw-bold text-body">No notes captured yet</h5>
          <Card.Text className="text-secondary small mx-auto" style={{ maxWidth: "380px" }}>
            Open a lecture inside the dynamic course module video player, and snap your thought collections instantly while learning.
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="vstack gap-4">
      <Card className="border-0 shadow-sm p-3 bg-white rounded-3">
        <Row className="align-items-center g-3">
          <Col xs={12} sm={6} md={4} lg={3} className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1.5 rounded-pill small">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </span>
            <span className="small fw-medium text-secondary">Captured in this Course</span>
          </Col>
          
          <Col xs={12} sm={6} md={5} lg={7}>
            <div className="position-relative w-100">
              <BsSearch
                size={14}
                className="position-absolute text-secondary"
                style={{ top: "50%", left: 12, transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.7 }}
              />
              <Form.Control
                size="md"
                type="text"
                className="bg-light-subtle border-light-subtle shadow-none rounded-3"
                placeholder="Search matching content or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </Col>

          <Col xs={12} md={3} lg={2} className="text-md-end">
            <Button
              size="md"
              variant="outline-orange"
              className="d-inline-flex align-items-center justify-content-center gap-2 rounded-3 w-100 w-md-auto mb-0 font-medium"
              onClick={() => exportNotesToPDF({ notes, lectureTitle: null, courseTitle })}
              title="Export all course notes as PDF document bundle"
            >
              <BsDownload size={14} /> <span>Export PDF</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {filteredNotes.length === 0 && (
        <Card className="text-center py-4 border-0 shadow-sm bg-white rounded-3">
          <p className="text-secondary small mb-0">
            No note references match keyword: <strong className="text-dark">&ldquo;{searchQuery}&rdquo;</strong>
          </p>
        </Card>
      )}

      <div className="vstack gap-3">
        {Object.entries(groupedNotes).map(([lecId, lecNotes]) => {
          const info = lectureMap[lecId];
          const lecTitle = info?.title || `Lecture ${lecId.slice(-6)}`;
          const secTitle = info?.sectionTitle;

          return (
            <Card key={lecId} className="border shadow-sm overflow-hidden rounded-3 bg-white">
              <Card.Header className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div className="min-w-0 flex-grow-1">
                  {secTitle && (
                    <div className="text-secondary small text-truncate text-uppercase tracking-wider fw-semibold mb-0.5" style={{ fontSize: "0.75rem" }}>
                      {secTitle}
                    </div>
                  )}
                  <h6 className="mb-0 fw-bold text-body text-truncate" style={{ fontSize: "0.95rem" }}>
                    {lecTitle}
                  </h6>
                </div>
                
                <div className="d-flex align-items-center gap-3 flex-shrink-0">
                  <span className="small text-secondary fw-medium">
                    {lecNotes.length} note{lecNotes.length !== 1 ? "s" : ""}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    title="Play Lecture"
                    className="d-inline-flex align-items-center gap-1 px-2 fw-semibold rounded-circle mb-0"
                    onClick={() => navigate(`/student/courses/${courseId}/watch/${lecId}`)}
                  >
                    <FaPlay />
                  </Button>
                </div>
              </Card.Header>

              <ListGroup variant="flush">
                {lecNotes.map((note) => (
                  <ListGroup.Item key={note.id} className="p-3 hover-bg-light transition-all">
                    <NoteItem
                      note={note}
                      isActive={false}
                      onSeek={() => navigate(`/student/courses/${courseId}/watch/${lecId}`)}
                      onEdit={editNote}
                      onDelete={removeNote}
                      submitting={submitting}
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          );
        })}
      </div>
    </div>
  );
}