import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function useInstructorMyCourses() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalItems: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const filters = {
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "5", 10),
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "recentUpdate",
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

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/instructor/courses`, {
        params: filters,
        withCredentials: true,
      });

      if (data.success) {
        setCourses(data.result || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load courses..");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, JSON.stringify(filters)]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/instructor/courses/stats`, {
        withCredentials: true,
      });
      if (data.success) setStats(data.result);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch courses stats..");
    } finally {
      setStatsLoading(false);
    }
  }, [backendUrl]);

  const togglePrivacy = async (courseId) => {
    setUpdatingId(courseId);
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/courses/${courseId}/toggle-privacy`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setCourses((prev) =>
          prev.map((c) =>
            c.courseId === courseId ? { ...c, isPrivate: data.result } : c
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change course's privacy..");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    courses,
    stats,
    pagination,

    ...filters,

    loading,
    statsLoading,
    updatingId,

    setPage: (page) => updateFilters({ page }),
    setSearch: (search) => updateFilters({ search }),
    setSort: (sort) => updateFilters({ sort }),
    togglePrivacy,
    refresh: () => {
      fetchCourses();
      fetchStats();
    },
  };
}