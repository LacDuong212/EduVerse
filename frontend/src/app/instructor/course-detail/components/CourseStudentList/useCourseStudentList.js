import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { handleRequest } from "@/utils/request";
import { authApi } from "@/utils/api";

export default function useCourseStudentList(courseId) {
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

    const res = await handleRequest(
      authApi.get(`/instructor/courses/${courseId}/students`, { params: filters, })
    );

    if (res.success) {
      setStudents(res.result || []);
      if (res.pagination) setPagination(res.pagination);
    }

    setLoading(false);
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
}