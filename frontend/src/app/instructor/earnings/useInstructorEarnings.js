import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function useInstructorEarnings() {
  const [earningsData, setEarningsData] = useState({
    series: [],
    thisMonthRevenue: null,
    toBePaid: null,
    totalEarning: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await handleRequest(authApi.get("/instructor/earnings"));

      if (res.success) {
        setEarningsData({
          series: res.result.series || [],
          thisMonthRevenue: res.result.thisMonthRevenue,
          toBePaid: res.result.toBePaid,
          totalEarning: res.result.totalEarning,
        });
      } else {
        const msg = res.message || "Failed to load earnings data..";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load earnings data..";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return {
    ...earningsData,
    loading,
    error,
    refresh: fetchEarnings,
  };
}