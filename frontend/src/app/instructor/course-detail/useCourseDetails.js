import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { handleRequest } from "@/utils/request";
import { authApi } from "@/utils/api";

export default function useCourseDetails() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);

    const res = await handleRequest(authApi.get(`/instructor/courses/${courseId}/details`));

    if (res.success) {
      setCourse(res.result);
      setStatusCode(res.statusCode);
    } else if (res.errors && Object.keys(res.errors)) {
      setError("Unable to find course..");
      setStatusCode(404);
    } else {
      setError(res.message)
      setStatusCode(res.statusCode);
    };

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, statusCode, error, refetch: fetchCourse, courseId };
}