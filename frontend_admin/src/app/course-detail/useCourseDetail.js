import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function useCourseDetail() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();

  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id || !backendUrl) return;

    setLoading(true);
    setError(null);
    setStatusCode(null);

    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        const courseData = data.result;

        const insId = courseData?.instructor?.insId;

        if (insId) {
          try {
            const statsRes = await axios.get(
              `${backendUrl}/api/instructors/${insId}/stats`,
              { withCredentials: true }
            );

            if (statsRes.data.success) {
              courseData.instructor.stats = statsRes.data.result;
            }
          } catch (statsErr) {
            console.error("Failed to fetch instructor stats:", statsErr);
          }
        }

        setCourse(courseData);
      }
    } catch (err) {
      const errData = err.response?.data;
      const status = err.response?.status;

      setStatusCode(status);

      if (status === 400 && errData?.errors) {
        setStatusCode(404);
      }

      const msg = errData?.message || "Something went wrong";
      setError(msg);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [id, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    course,

    loading,
    error,
    statusCode,

    refetch: fetchData,
  };
}