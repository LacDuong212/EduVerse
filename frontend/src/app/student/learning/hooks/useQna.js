import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useQna({ fixedLectureId, courseId: courseIdProp } = {}) {
  const params = useParams();
  const courseId = courseIdProp || params.courseId || params.id;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const lectureFilterRef = useRef(fixedLectureId ?? null);

  const fetchQna = useCallback(
    async (pageNum = 1, lectureId = lectureFilterRef.current) => {
      if (!courseId || !backendUrl) return;
      setLoading(true);
      try {
        const params = { page: pageNum, limit: 10 };
        if (lectureId) params.lectureId = lectureId;

        const { data } = await axios.get(
          `${backendUrl}/api/qa/courses/${courseId}`,
          { params, withCredentials: true }
        );

        if (data.success) {
          setQuestions(data.result || []);
          setPagination(data.pagination || {});
          setPage(pageNum);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load Q&A.");
      } finally {
        setLoading(false);
      }
    },
    [courseId]
  );

  useEffect(() => {
    fetchQna(1);
  }, [fetchQna]);

  const postQuestion = async ({ content, lectureId }) => {
    if (!courseId || !backendUrl) return false;
    setSubmitting(true);
    const resolvedLectureId = lectureId ?? fixedLectureId ?? null;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/qa/courses/${courseId}`,
        { content, lectureId: resolvedLectureId },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Question posted!");
        setQuestions((prev) => [data.result, ...prev]);
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post question.");
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const postReply = async (questionId, { content }) => {
    if (!backendUrl) return false;
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/qa/${questionId}/replies`,
        { content },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Reply posted!");
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, replies: [...(q.replies || []), data.result] }
              : q
          )
        );
        return true;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const deleteQna = async (id, parentId = null) => {
    if (!backendUrl) return;
    try {
      await axios.delete(`${backendUrl}/api/qa/${id}`, {
        withCredentials: true,
      });
      toast.success("Deleted.");

      if (parentId) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === parentId
              ? { ...q, replies: q.replies.filter((r) => r.id !== id) }
              : q
          )
        );
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const toggleResolve = async (id) => {
    if (!backendUrl) return;
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/qa/${id}/resolve`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, isResolved: data.result.isResolved } : q
          )
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update.");
    }
  };

  const changeLectureFilter = (lectureId) => {
    lectureFilterRef.current = lectureId || null;
    fetchQna(1, lectureId || null);
  };

  const handlePageChange = (p) => fetchQna(p);

  return {
    questions,
    loading,
    submitting,
    pagination,
    page,
    postQuestion,
    postReply,
    deleteQna,
    toggleResolve,
    changeLectureFilter,
    handlePageChange,
    refresh: () => fetchQna(1),
  };
}
