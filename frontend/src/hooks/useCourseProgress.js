import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useCourseProgress(courseId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${backendUrl}/api/student/courses/${encodeURIComponent(
        courseId
      )}/progress`;

      const { data } = await axios.get(url, {
        withCredentials: true,
      });

      if (data?.success) {
        setProgress(data.result || null);
      } else {
        setProgress(null);
        setError(data?.message || "Failed to load progress");
      }
    } catch (err) {
      setProgress(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error loading progress"
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh: fetchProgress,
  };
}