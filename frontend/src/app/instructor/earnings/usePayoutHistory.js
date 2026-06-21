import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function usePayoutHistory() {
  const [payouts,    setPayouts]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [page,       setPage]       = useState(1);
  const [totalPaid,      setTotalPaid]      = useState(0);
  const [approvedAmount, setApprovedAmount] = useState(0);

  const fetchPayouts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const response = await authApi.get(`/instructor/payouts?page=${p}&limit=10`);
      const data = response?.data;
      if (data?.success) {
        setPayouts(data.result || []);
        setPagination(data.pagination || { totalPages: 1, totalItems: 0 });
        setTotalPaid(data.totalPaid ?? 0);
        setApprovedAmount(data.approvedAmount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPayout = useCallback(async (data) => {
    setSubmitting(true);
    try {
      const res = await handleRequest(authApi.post("/instructor/payouts", data));
      if (res.success) {
        toast.success("Payout request submitted!");
        fetchPayouts(1);
        setPage(1);
        return true;
      }
      toast.error(res.message || "Failed to submit payout request.");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit payout request.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchPayouts]);

  useEffect(() => {
    fetchPayouts(page);
  }, [page, fetchPayouts]);

  return {
    payouts,
    loading,
    submitting,
    pagination,
    page,
    setPage,
    requestPayout,
    refresh: fetchPayouts,
    totalPaid,
    approvedAmount,
  };
}
