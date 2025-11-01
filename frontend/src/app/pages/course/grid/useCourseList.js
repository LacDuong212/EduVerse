// src/features/courses/useCourseList.js
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";

// Sửa path slice cho đúng dự án của bạn
import { setAllCourses, appendCourses } from "@/redux/coursesSlice";

export default function useCourseList() {
  const navigate = null; // bạn không dùng navigate trong hook này
  const dispatch = useDispatch();
  const { allCourses } = useSelector((state) => state.courses || { allCourses: [] });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // local state (giữ nguyên style của bạn)
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Chuẩn hoá response (hỗ trợ cả 2 schema cũ/mới)
  const parseCoursesResponse = (res) => {
    const d = res?.data || {};
    // mới: { success, data, pagination: { total, page, totalPages } }
    if (Array.isArray(d.data) && d.pagination) {
      return {
        list: d.data,
        total: Number(d.pagination.total || 0),
        page: Number(d.pagination.page || 1),
        totalPages: Number(d.pagination.totalPages || 1),
      };
    }
    // cũ: { success, courses, total, page, pages }
    return {
      list: Array.isArray(d.courses) ? d.courses : [],
      total: Number(d.total || 0),
      page: Number(d.page || 1),
      totalPages: Number(d.pages || 1),
    };
  };

  // fetch API (giữ tên/flow như bạn đang dùng)
  const fetchCourses = async (currentPage, reset = false) => {
    try {
      setLoading(true);

      // build URL (encode để an toàn)
      const qs = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
      }).toString();

      const res = await axios.get(`${backendUrl}/api/courses?${qs}`);

      const parsed = parseCoursesResponse(res);
      if (reset) {
        dispatch(setAllCourses(parsed.list)); // reset khi đổi category/search
      } else {
        dispatch(appendCourses(parsed.list)); // nối thêm khi scroll
      }
      setTotal(parsed.total);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  // load lần đầu & khi filter/search đổi
  useEffect(() => {
    setPage(1);
    dispatch(setAllCourses([]));
    fetchCourses(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  // load thêm khi page tăng
  useEffect(() => {
    if (page > 1) {
      fetchCourses(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // API nạp thêm (cho nút "Load more" hoặc infinite scroll)
  const loadMore = () => {
    if (loading) return;
    const loaded = allCourses.length;
    if (loaded < total) setPage((p) => p + 1);
  };

  return {
    // redux data
    allCourses,
    // local state & setter
    page,
    limit,
    total,
    category,
    setCategory,
    search,
    setSearch,
    loading,
    // actions
    fetchCourses, // nếu cần gọi thủ công
    loadMore,
    setPage, // nếu cần nhảy trang cụ thể
  };
}
