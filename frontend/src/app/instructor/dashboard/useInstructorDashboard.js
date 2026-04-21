import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export default function useInstructorDashboard() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [topCourses, setTopCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, earningRes, topCoursesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/instructor/stats`, {
          withCredentials: true,
        }),
        axios.get(`${backendUrl}/api/instructor/courses/revenue`, {
          withCredentials: true,
        }),
        axios.get(`${backendUrl}/api/instructor/courses/top-courses?limit=5`, {
          withCredentials: true,
        }),
      ]);

      setStats(statsRes.data.result);
      setRevenueChart(earningRes.data.result.series);
      setTopCourses(topCoursesRes.data.result);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    revenueChart,
    topCourses,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};