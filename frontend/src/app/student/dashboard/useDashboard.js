import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setRecommendedCourses } from "@/redux/coursesSlice";

export const useDashboard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.userData);
  const recommendedCourses = useSelector(
    (state) => state.courses?.recommended || []
  );

  const [recLoading, setRecLoading] = useState(false);

  // STATS
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, courseStatsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/student/stats`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/student/courses/stats`, { withCredentials: true }),
      ]);
      setStats(statsRes?.data?.result || null);
      setCourseStats(courseStatsRes?.data?.result || null);
    } catch {
      // non-blocking — silently fail
    }
  }, [backendUrl]);

  // IN-PROGRESS COURSES
  const [inProgressCourses, setInProgressCourses] = useState([]);

  const fetchInProgressCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/student/courses`, {
        params: { sort: "activityDesc", limit: 20, page: 1 },
        withCredentials: true,
      });
      const all = res?.data?.result?.data || [];
      const filtered = all
        .filter((c) => c.percentage < 100)
        .slice(0, 5);
      setInProgressCourses(filtered);
    } catch {
      // non-blocking
    }
  }, [backendUrl]);

  // RECOMMEND
  const fetchRecommendations = useCallback(
    async (force = false) => {
      if (!user || user.role !== "student") {
        dispatch(setRecommendedCourses([]));
        return;
      }

      if (!force && recommendedCourses.length > 0) {
        return;
      }

      try {
        setRecLoading(true);

        const res = await axios.get(
          `${backendUrl}/api/courses/recommendations`,
          { withCredentials: true }
        );

        if (res?.data?.success) {
          dispatch(setRecommendedCourses(res.data?.result?.courses || []));
        } else {
          dispatch(setRecommendedCourses([]));
        }
      } catch (err) {
        console.warn(
          "Recommendations skipped:",
          err?.response?.data?.message || err?.message
        );
        dispatch(setRecommendedCourses([]));
      } finally {
        setRecLoading(false);
      }
    },
    [backendUrl, dispatch, user, recommendedCourses.length]
  );

  // INIT
  const fetchDashboardData = useCallback(
    async (force = false) => {
      await Promise.all([
        fetchRecommendations(force),
        fetchStats(),
        fetchInProgressCourses(),
      ]);
    },
    [fetchRecommendations, fetchStats, fetchInProgressCourses]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    courseStats,
    inProgressCourses,
    loading: recLoading,
    refetch: () => fetchDashboardData(true),
  };
};

export default useDashboard;