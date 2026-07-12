import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function useInstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [studentDistribution, setStudentDistribution] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, earningRes, topCoursesRes, trendsRes, distributionRes] = await Promise.all([
        handleRequest(authApi.get("/instructor/stats")),
        handleRequest(authApi.get("/instructor/courses/revenue")),
        handleRequest(authApi.get("/instructor/courses/top-courses?limit=5")),
        handleRequest(authApi.get("/instructor/dashboard/enrollment-trends")),
        handleRequest(authApi.get("/instructor/dashboard/student-distribution?limit=10"))
      ]);

      if (statsRes.success) setStats(statsRes.result);
      if (earningRes.success) setRevenueChart(earningRes.result?.series || []);
      if (topCoursesRes.success) setTopCourses(topCoursesRes.result || []);
      if (trendsRes.success) setEnrollmentTrends(trendsRes.result?.series || []);
      if (distributionRes.success) setStudentDistribution(distributionRes.result || []);

      const failed = [statsRes, earningRes, topCoursesRes, trendsRes, distributionRes].find((r) => !r.success);
      if (failed) setError(failed.message);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(err.message || "Failed to fetch dashboard data");
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
    enrollmentTrends,
    studentDistribution,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}