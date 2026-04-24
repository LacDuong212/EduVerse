import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function useInstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [topCourses, setTopCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statsRes = await handleRequest(authApi.get("/instructor/stats"));
      const earningRes = await handleRequest(authApi.get("/instructor/courses/revenue"));
      const topCoursesRes = await handleRequest(authApi.get("/instructor/courses/top-courses?limit=5"));

      if (statsRes.success) setStats(statsRes.result);
      if (earningRes.success) setRevenueChart(earningRes.result?.series || []);
      if (topCoursesRes.success) setTopCourses(topCoursesRes.result || []);

      const failed = [statsRes, earningRes, topCoursesRes].find((r) => !r.success);
      if (failed) setError(failed.message);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
}