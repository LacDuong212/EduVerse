import { useEffect, useState, useCallback } from "react";
import axios from "axios";

/**
 * Hook lấy chi tiết 1 khóa học theo ID
 * @param {string} courseId - ID của khóa học (Mongo _id)
 * @returns {{ course:any, loading:boolean, error:string|null, refresh:Function }}
 */
export default function useCourseById(courseId) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return; // không gọi nếu thiếu id
    try {
      setLoading(true);
      setError(null);

      const url = `${backendUrl}/api/courses/${encodeURIComponent(courseId)}`;
      const { data } = await axios.get(url, { withCredentials: true });

      // API của bạn: { success: true, course: {...} }
      if (data?.success && data?.course) {
        setCourse(data.course);
      } else {
        setCourse(null);
        setError(data?.message || "Failed to load course");
      }
    } catch (err) {
      setCourse(null);
      setError(err?.response?.data?.message || err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, courseId]);

  useEffect(() => {
    // reset khi đổi id để tránh nhấp nháy dữ liệu cũ
    setCourse(null);
    setError(null);
    if (!courseId) return;

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const url = `${backendUrl}/api/courses/${encodeURIComponent(courseId)}`;
        const { data } = await axios.get(url, { withCredentials: true });
        if (!isMounted) return;

        if (data?.success && data?.course) {
          setCourse(data.course);
        } else {
          setCourse(null);
          setError(data?.message || "Failed to load course");
        }
      } catch (err) {
        if (!isMounted) return;
        setCourse(null);
        setError(err?.response?.data?.message || err?.message || "Error");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [backendUrl, courseId]);

  return { course, loading, error, refresh: fetchCourse };
}
