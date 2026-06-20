import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/utils/api";
import { toast } from "react-toastify";

export default function useNotes({ lectureId, courseId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courseNotes, setCourseNotes] = useState([]);
  const [courseNotesLoading, setCourseNotesLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!lectureId) return;
    setLoading(true);
    try {
      const { data } = await authApi.get(`/notes/lectures/${lectureId}`);
      if (data.success) setNotes(data.result);
    } catch {
      toast.error("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    setNotes([]);
    fetchNotes();
  }, [fetchNotes]);

  const fetchCourseNotes = useCallback(async () => {
    if (!courseId) return;
    setCourseNotesLoading(true);
    try {
      const { data } = await authApi.get(`/notes/courses/${courseId}`);
      if (data.success) setCourseNotes(data.result);
    } catch {
      toast.error("Failed to load course notes.");
    } finally {
      setCourseNotesLoading(false);
    }
  }, [courseId]);

  const addNote = useCallback(
    async ({ timestamp, content, tags = [] }) => {
      if (!lectureId || !courseId) return null;
      setSubmitting(true);
      try {
        const { data } = await authApi.post("/notes", {
          lectureId,
          courseId,
          timestamp,
          content,
          tags,
        });
        if (data.success) {
          const newNote = data.result;
          setNotes((prev) => {
            const next = [...prev, newNote];
            next.sort((a, b) => a.timestamp - b.timestamp);
            return next;
          });
          // Keep courseNotes in sync if already loaded (timeline order)
          setCourseNotes((prev) => {
            if (!prev.length) return prev;
            const next = [...prev, newNote];
            next.sort((a, b) => a.timestamp - b.timestamp);
            return next;
          });
          return newNote;
        }
      } catch {
        toast.error("Failed to save note.");
      } finally {
        setSubmitting(false);
      }
      return null;
    },
    [lectureId, courseId]
  );

  const editNote = useCallback(async (id, { content, tags }) => {
    setSubmitting(true);
    try {
      const { data } = await authApi.patch(`/notes/${id}`, { content, tags });
      if (data.success) {
        const updated = data.result;
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        setCourseNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        return true;
      }
    } catch {
      toast.error("Failed to update note.");
    } finally {
      setSubmitting(false);
    }
    return false;
  }, []);

  const removeNote = useCallback(async (id) => {
    try {
      await authApi.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setCourseNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Failed to delete note.");
    }
  }, []);

  return {
    notes,
    loading,
    submitting,
    addNote,
    editNote,
    removeNote,
    courseNotes,
    courseNotesLoading,
    fetchCourseNotes,
  };
}
