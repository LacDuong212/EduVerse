import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { handleRequest } from "@/utils/request";
import { authApi } from "@/utils/api";

export default function useCourseDetails() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);

    const res = await handleRequest(authApi.get(`/instructor/courses/${courseId}/details`));

    if (res.success) {
      setCourse(res.result);
    } else {
      setError(res.message);
    }

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse, courseId };
}