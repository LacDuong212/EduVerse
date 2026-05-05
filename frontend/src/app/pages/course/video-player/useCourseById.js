import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function useCourseById(courseId) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${backendUrl}/api/student/courses/${encodeURIComponent(
        courseId
      )}`;

      const { data } = await axios.get(url, {
        withCredentials: true,
      });

      if (data?.success) {
        setCourse(data.result?.course || null);
      } else {
        setCourse(null);
        setError(data?.message || "Failed to load course");
      }
    } catch (err) {
      setCourse(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error loading course"
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl, courseId]);

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
      if (!courseId || !backendUrl) return;

      setCourse(null);
      setError(null);
      setLoading(true);

      try {
        const url = `${backendUrl}/api/student/courses/${encodeURIComponent(
          courseId
        )}`;

        const { data } = await axios.get(url, {
          withCredentials: true,
        });

        if (!isMounted) return;

        if (data?.success) {
          setCourse(data.result?.course || null);
        } else {
          setCourse(null);
          setError(data?.message || "Failed to load course");
        }
      } catch (err) {
        if (!isMounted) return;

        setCourse(null);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Error loading course"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, courseId]);

  return {
    course,
    loading,
    error,
    refresh: fetchCourse,
  };
}