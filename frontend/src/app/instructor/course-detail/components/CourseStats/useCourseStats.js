import { useState, useEffect, useCallback } from "react";
import { handleRequest } from "@/utils/request";
import { authApi } from "@/utils/api";

const useCourseAnalytics = (courseId, endpoint) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    const res = await handleRequest(authApi.get(`/instructor/courses/${courseId}/${endpoint}`));

    if (res.success) {
      setData(res.result.series || []);
      setTotal(res.result.total || 0);
    } else {
      setError(res.message);
    }

    setLoading(false);
  }, [courseId, endpoint]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, total, loading, error, refetch: fetchAnalytics };
};

export const useCourseEnrollments = (courseId) => useCourseAnalytics(courseId, "enrollments");
export const useCourseRevenue = (courseId) => useCourseAnalytics(courseId, "revenue");