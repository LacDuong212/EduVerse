import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/utils/api";
import { toast } from "react-toastify";

export default function useCourseNotes(courseId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data } = await authApi.get(`/notes/courses/${courseId}`);
      if (data.success) setNotes(data.result);
    } catch {
      toast.error("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const editNote = useCallback(async (id, { content, tags }) => {
    setSubmitting(true);
    try {
      const { data } = await authApi.patch(`/notes/${id}`, { content, tags });
      if (data.success) {
        setNotes((prev) => prev.map((n) => (n.id === id ? data.result : n)));
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
    } catch {
      toast.error("Failed to delete note.");
    }
  }, []);

  return { notes, loading, submitting, editNote, removeNote, refetch: fetchNotes };
}
