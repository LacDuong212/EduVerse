// src/hooks/useMyOrders.js
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function useMyOrders() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`${backendUrl}/api/orders`, {
        withCredentials: true,
      });

      if (data?.success) {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        setOrders([]);
        toast.error(data?.message || "Fetch orders failed");
      }
    } catch (e) {
      setOrders([]);
      setError(e);
      toast.error(e?.response?.data?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o?.status === "completed").length;
    const pending = orders.filter((o) => o?.status === "pending").length;
    const cancelled = orders.filter((o) => o?.status === "cancelled").length;
    const refunded = orders.filter((o) => o?.status === "refunded").length;
    return { total, completed, pending, cancelled, refunded };
  }, [orders]);

  return { orders, loading, error, refetch: fetchOrders, stats };
}
