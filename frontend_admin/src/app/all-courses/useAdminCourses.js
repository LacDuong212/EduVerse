import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";


export default function useAdminCourses() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { admin, isAuthenticated } = useSelector((state) => state.admin);

  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({
    totalCourses: 0,
    activatedCourses: 0,
    pendingCourses: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (page !== 1) {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCourses = useCallback(async () => {
    if (!isAuthenticated && !admin) return;

    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/courses/overview`, {
        params: {
          page: page,
          limit: 8,
          search: debouncedSearch
        },
        withCredentials: true
      });

      const { data } = response;

      if (data.success) {
        setCourses(data.data);
        setMeta(data.meta);
      } else {
        toast.error(data.message || "Failed to load courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, isAuthenticated, admin, page, debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    meta,
    loading,
    page,
    setPage,
    search,
    setSearch,
    refreshCourses: fetchCourses,
  };
}
