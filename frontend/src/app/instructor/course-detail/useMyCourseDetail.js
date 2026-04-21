import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useCourseAnalytics = (endpoint) => {
  const { id: courseId } = useParams();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data: res } = await axios.get(
        `${backendUrl}/api/instructor/courses/${courseId}/${endpoint}`,
        { withCredentials: true }
      );
      if (res.success) {
        setData(res.result.series);
        setTotal(res.result.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics..");
    } finally {
      setLoading(false);
    }
  }, [courseId, endpoint]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, total, loading, error, refetch: fetchAnalytics };
};

export const useCourseEnrollments = () => useCourseAnalytics("enrollments");
export const useCourseRevenue = () => useCourseAnalytics("revenue");

export const useCourseStudentList = () => {
  const { id: courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
  });

  const filters = {
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "enrolledDesc",
  };

  const updateFilters = (newFilters) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!newFilters.page) params.set("page", "1");
      return params;
    });
  };

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data: res } = await axios.get(
        `${backendUrl}/api/instructor/courses/${courseId}/students`,
        { params: filters, withCredentials: true }
      );

      if (res.success) {
        setStudents(res.result);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch student list..");
    } finally {
      setLoading(false);
    }
  }, [courseId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    ...pagination,
    ...filters,
    setPage: (page) => updateFilters({ page }),
    setSearch: (search) => updateFilters({ search }),
    setSort: (sort) => updateFilters({ sort }),
    refetch: fetchStudents,
  };
};

export default function useMyCourseDetail() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data: res } = await axios.get(
        `${backendUrl}/api/instructor/courses/${courseId}/details`,
        { withCredentials: true }
      );
      if (res.success) setCourse(res.result);
    } catch (err) {
      setError(err.response?.data?.message || "Course details unavailable..");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse, courseId };
}