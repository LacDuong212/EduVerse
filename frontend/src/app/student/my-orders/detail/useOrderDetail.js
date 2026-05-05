import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export const useOrderDetail = (orderId) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId || !backendUrl) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        `${backendUrl}/api/orders/${orderId}`,
        { withCredentials: true }
      );

      if (data?.success) {
        setOrder(data?.result || null);
      } else {
        setOrder(null);
        setError(data?.message || "Failed to load order detail");
      }
    } catch (err) {
      setOrder(null);
      setError(
        err?.response?.data?.message ||
          (err?.response?.status === 404
            ? "Order not found."
            : "Something went wrong while loading order detail.")
      );
    } finally {
      setLoading(false);
    }
  }, [backendUrl, orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrderDetail,
    setOrder,
  };
};

export default useOrderDetail;