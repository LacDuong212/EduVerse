import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { setAllCourses } from "@/redux/coursesSlice";

export default function useCourseList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const { allCourses = [] } = useSelector((state) => state.courses || {});

  const getParam = (key, defaultValue = "") => searchParams.get(key) || defaultValue;

  const filters = {
    page: parseInt(getParam("page", "1"), 10),
    limit: parseInt(getParam("limit", "9"), 10),
    category: getParam("category"),
    search: getParam("search"),
    sort: getParam("sort", "newest"),
    price: getParam("price"),
    level: getParam("level"),
    language: getParam("language"),
  };

  const updateFilters = (newFilters) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      if (!newFilters.page) params.set("page", "1");
      return params;
    });
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
      );

      const { data } = await axios.get(`${backendUrl}/api/courses`, {
        params: cleanParams
      });

      if (data.success) {
        dispatch(setAllCourses(data.result));
        setTotal(data.pagination?.totalItems || 0);
      }
    } catch (error) {
      console.error("Fetch Courses Error:", error);

      const errRes = error.response?.data;
      if (errRes?.errors) {
        const firstError = errRes.errors[0];
        const field = firstError.field.split('.').pop();
        toast.error(`${field}: ${firstError.message}`);
      } else {
        toast.error(errRes?.message || "Error fetching courses");
      }

      dispatch(setAllCourses([]));
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, dispatch, JSON.stringify(filters)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const clearFilters = () => {
    setSearchParams({});
  };

  return {
    allCourses,
    loading,
    total,
    ...filters,

    setPage: (p) => updateFilters({ page: p }),
    setCategory: (c) => updateFilters({ category: c }),
    setSearch: (s) => updateFilters({ search: s }),
    setSort: (s) => updateFilters({ sort: s }),
    setPrice: (p) => updateFilters({ price: p }),
    setLevel: (l) => updateFilters({ level: l }),
    setLanguage: (l) => updateFilters({ language: l }),
    clearFilters,
  };
}