import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function useInstructorMyStudents() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActive: 0,
    totalInactive: 0,
  });

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

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
    setLoading(true);
    try {
      const { data: res } = await axios.get(`${backendUrl}/api/instructor/students`, {
        params: filters,
        withCredentials: true,
      });

      if (res.success) {
        setStudents(res.result || []);
        if (res.pagination) {
          setPagination({
            totalItems: res.pagination.totalItems,
            totalPages: res.pagination.totalPages,
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load student list");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, JSON.stringify(filters)]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data: res } = await axios.get(`${backendUrl}/api/instructor/students/stats`, {
        withCredentials: true,
      });
      if (res.success) {
        setStats(res.result);
      }
    } catch (err) {
      console.error("Failed to fetch student stats..", err);
    } finally {
      setStatsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    students,
    stats,
    pagination,

    ...filters,

    loading,
    statsLoading,

    setPage: (page) => updateFilters({ page }),
    setSearch: (search) => updateFilters({ search }),
    setSort: (sort) => updateFilters({ sort }),
    refresh: () => {
      fetchStudents();
      fetchStats();
    },
  };
}