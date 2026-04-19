import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export default function useInstructorMyCourses(initialParams = {}) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalItems: 0,
    totalPages: 1,
  });

  const [stats, setStats] = useState(null);

  const [params, setParams] = useState({
    ...initialParams,
  });

  const [statsLoading, setStatsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(
    async (overrideParams = {}) => {
      const finalParams = { ...params, ...overrideParams };

      setCoursesLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `${backendUrl}/api/instructor/courses`,
          {
            params: finalParams,
            withCredentials: true,
          }
        );

        const result = res.data.result;
        const pagination = res.data.pagination;

        setCourses(result);
        setPagination(pagination);
        setParams(finalParams);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setCoursesLoading(false);
      }
    },
    [backendUrl, params]
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/courses/stats`,
        { withCredentials: true }
      );

      if (data.success)
        setStats(data.result);
      else setError(data.message);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setStatsLoading(false);
    }
  }, [backendUrl]);

  const updateCoursePrivacy = useCallback(
    async (courseId, isPrivate) => {
      try {
        await axios.patch(
          `${backendUrl}/api/instructor/courses/${courseId}/privacy`,
          { privacy: isPrivate },
          { withCredentials: true }
        );

        // optimistic update
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, isPrivate } : c
          )
        );
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [backendUrl]
  );

  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, []); // load once on page mount

  return {
    // data
    courses,
    pagination,
    stats,

    // ui state
    statsLoading,
    coursesLoading,
    error,

    // list controls
    setPage: (page) => fetchCourses({ page }),
    setSearch: (search) => fetchCourses({ page: 1, search }),
    setSort: (sort) => fetchCourses({ page: 1, sort }),
    refetchList: fetchCourses,

    // stats
    refetchStats: fetchStats,

    // actions
    updateCoursePrivacy,
  };
}
