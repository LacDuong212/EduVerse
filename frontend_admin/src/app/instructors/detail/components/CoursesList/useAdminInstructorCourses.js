import { useCallback, useEffect, useState } from "react";
import { getAdminInstructorCourses } from "@/helpers/data";

export default function useAdminInstructorCourses(instructorId, pageSize = 10) {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchCourses = useCallback(async (p = page) => {
    if (!instructorId) return;
    setLoading(true);
    const res = await getAdminInstructorCourses(instructorId, p, pageSize);
    if (res.success) {
      setCourses(res.data);
      setPagination(res.pagination);
    }
    setLoading(false);
  }, [instructorId, page, pageSize]);

  useEffect(() => {
    fetchCourses(page);
  }, [instructorId, page]);

  const goToPage = (p) => setPage(p);

  return { courses, setCourses, pagination, loading, page, goToPage, refresh: () => fetchCourses(page) };
}
