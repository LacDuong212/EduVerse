import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setRecommendedCourses } from "@/redux/coursesSlice";

const ALL_CATEGORIES = [
  "Web Development",
  "Security",
  "Information Technology",
  "DevOps",
  "Data",
  "Network",
  "Mobile Development",
  "Artificial Intelligence",
];

export const useDashboard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.userData);
  const recommendedCourses = useSelector(
    (state) => state.courses?.recommended || []
  );

  const [radar, setRadar] = useState(null);
  const [radarLoading, setRadarLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= STATS =================
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

  // ================= IN-PROGRESS COURSES =================
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

  // ================= RADAR =================
  const fetchRadar = useCallback(async () => {
    try {
      setRadarLoading(true);
      setError(null);

      const res = await axios.get(
        `${backendUrl}/api/student/skill-radar`,
        { withCredentials: true }
      );

      const payload = res?.data?.result || {};

      const apiLabels = Array.isArray(payload?.labels) ? payload.labels : [];
      const apiValues = Array.isArray(payload?.values) ? payload.values : [];
      const apiSystem = Array.isArray(payload?.systemAvgValues)
        ? payload.systemAvgValues
        : [];

      const userMap = {};
      const systemMap = {};

      apiLabels.forEach((label, i) => {
        userMap[label] = Number(apiValues[i] ?? 0);
        systemMap[label] = Number(apiSystem[i] ?? 0);
      });

      const labels = ALL_CATEGORIES;
      const values = labels.map((l) => userMap[l] ?? 0);
      const systemAvgValues = labels.map((l) => systemMap[l] ?? 0);

      setRadar({
        labels,
        values,
        systemAvgValues,
        raw: payload?.raw || {},
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load skill radar."
      );
      setRadar(null);
    } finally {
      setRadarLoading(false);
    }
  }, [backendUrl]);

  // ================= RECOMMEND =================
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

  // ================= INIT =================
  const fetchDashboardData = useCallback(
    async (force = false) => {
      await Promise.all([
        fetchRadar(),
        fetchRecommendations(force),
        fetchStats(),
        fetchInProgressCourses(),
      ]);
    },
    [fetchRadar, fetchRecommendations, fetchStats, fetchInProgressCourses]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    radar,
    stats,
    courseStats,
    inProgressCourses,
    loading: radarLoading || recLoading,
    error,
    refetch: () => fetchDashboardData(true),
  };
};

export default useDashboard;