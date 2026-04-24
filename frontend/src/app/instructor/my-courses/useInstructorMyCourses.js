import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function useInstructorMyCourses() {
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
      const res = await handleRequest(authApi.get("/instructor/courses", { params: filters }));

      if (res.success) {
        setCourses(res.result || []);
        if (res.pagination) setPagination(res.pagination);
      } else {
        toast.error(res.message || "Failed to load courses..");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load courses..");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await handleRequest(authApi.get("/instructor/courses/stats"));
      if (res.success) setStats(res.result);
      else toast.error(res.message || "Failed to fetch courses stats..");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch courses stats..");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const togglePrivacy = async (courseId) => {
    setUpdatingId(courseId);
    try {
      const res = await handleRequest(authApi.patch(`/courses/${courseId}/toggle-privacy`));

      if (res.success) {
        toast.success(res.message);
        setCourses((prev) =>
          prev.map((c) =>
            c.courseId === courseId ? { ...c, isPrivate: res.result } : c
          )
        );
      } else {
        toast.error(res.message || "Failed to change course's privacy..");
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