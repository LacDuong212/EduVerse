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

    const res = await handleRequest(authApi.get("/instructor/courses", { params: filters }));
    if (res.success) {
      setCourses(res.result || []);
      if (res.pagination) setPagination(res.pagination);
    } else {
      toast.error(res.message || "Failed to load courses..");
    }

    setLoading(false);
  }, [JSON.stringify(filters)]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);

    const res = await handleRequest(authApi.get("/instructor/courses/stats"));
    if (res.success) setStats(res.result);
    else toast.error(res.message || "Failed to fetch courses statistics..");

    setStatsLoading(false);
  }, []);

  const togglePrivacy = async (courseId) => {
    if (!courseId) return toast.error("Unable to obtain course info. Please try again later.");
  
    setUpdatingId(courseId);

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

    setUpdatingId(null);
  };

  const handleRemoveDraft = async (courseId) => {
    if (!courseId) return toast.error("Unable to obtain course info. Please try again later.");
    if (!window.confirm("Permanently remove this draft course?")) return;

    setUpdatingId(courseId);

    const res = await handleRequest(
      authApi.delete(`/instructor/courses/drafts/${courseId}`)
    );

    if (res.success) {
      toast.success(res.message);
      fetchCourses();
      fetchStats();
    } else {
      toast.error(res.message || "Failed to remove course..");
    }

    setUpdatingId(null);
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
    handleRemoveDraft,
    refresh: () => {
      fetchCourses();
      fetchStats();
    },
  };
}