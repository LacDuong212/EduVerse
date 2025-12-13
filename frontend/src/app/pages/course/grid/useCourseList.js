import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { setAllCourses } from "@/redux/coursesSlice";

export default function useCourseList() {
  const dispatch = useDispatch();

  const { allCourses } = useSelector(
    (state) => state.courses || { allCourses: [] }
  );

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("");
  const [language, setLanguage] = useState("");

  const [loading, setLoading] = useState(false);

  const parseCoursesResponse = (res) => {
    const d = res?.data || {};

    if (Array.isArray(d.data) && d.pagination) {
      return {
        list: d.data,
        total: Number(d.pagination.total || 0),
      };
    }

    return {
      list: Array.isArray(d.courses) ? d.courses : [],
      total: Number(d.total || 0),
    };
  };

  const fetchCourses = useCallback(async () => {
    if (page === 0) return;

    try {
      setLoading(true);

      const params = {
        page,
        limit,
        ...(category && { category }),
        ...(search && { search }),
        ...(sort && { sort }),
        ...(price && { price }),
        ...(level && { level }),
        ...(language && { language }),
      };

      const res = await axios.get(`${backendUrl}/api/courses`, { params });

      const parsed = parseCoursesResponse(res);

      dispatch(setAllCourses(parsed.list));
      setTotal(parsed.total);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching courses");
      dispatch(setAllCourses([]));
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, category, dispatch, limit, page, search, sort, price, level, language]);

  useEffect(() => {
    setPage(1);
  }, [category, search, sort, price, level, language]);

  useEffect(() => {
    fetchCourses();
  }, [page, fetchCourses]);

  const clearFilters = () => {
    setCategory("");
    setSearch("");
    setSort("newest");
    setPrice("");
    setLevel("");
    setLanguage("");
    setPage(1);
  };

  return {
    allCourses,
    page,
    limit,
    total,
    category,
    setCategory,
    search,
    setSearch,
    loading,
    setPage,
    sort,
    setSort,
    price,
    setPrice,
    level,
    setLevel,
    language,
    setLanguage,
    clearFilters,
  };
}
