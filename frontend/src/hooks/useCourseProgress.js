// useCourseProgress.js
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useCourseProgress(courseId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId || !backendUrl) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${backendUrl}/api/courses/${encodeURIComponent(
        courseId
      )}/progress`;

      const { data } = await axios.get(url, { withCredentials: true });

      if (data?.success && data?.progress) {
        setProgress(data.progress);
      } else {
        setProgress(null);
        setError(data?.message || "Failed to load progress");
      }
    } catch (err) {
      setProgress(null);
      setError(
        err?.response?.data?.message || err?.message || "Error loading progress"
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    setProgress(null);
    setError(null);
    if (!courseId || !backendUrl) return;

    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const url = `${backendUrl}/api/courses/${encodeURIComponent(
          courseId
        )}/progress`;

        const { data } = await axios.get(url, { withCredentials: true });

        if (!isMounted) return;

        if (data?.success && data?.progress) {
          setProgress(data.progress);
        } else {
          setProgress(null);
          setError(data?.message || "Failed to load progress");
        }
      } catch (err) {
        if (!isMounted) return;
        setProgress(null);
        setError(
          err?.response?.data?.message || err?.message || "Error loading progress"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return { progress, loading, error, refresh: fetchProgress };
}
