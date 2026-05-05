import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DEFAULT_LIMIT = 8;

export const useMyOrders = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
    sort: "newest",
    status: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: DEFAULT_LIMIT,
  });

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    refunded: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const { data } = await axios.get(`${backendUrl}/api/orders/stats`, {
        withCredentials: true,
      });

      if (data?.success) {
        const result = data?.result || {};
        setStats({
          total: Number(result?.total ?? 0),
          completed: Number(result?.completed ?? 0),
          pending: Number(result?.pending ?? 0),
          cancelled: Number(result?.cancelled ?? 0),
          refunded: Number(result?.refunded ?? 0),
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error loading order stats");
    } finally {
      setStatsLoading(false);
    }
  }, [backendUrl]);

  const fetchOrders = useCallback(
    async (activeFilters) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(activeFilters.page || 1));
        params.set("limit", String(DEFAULT_LIMIT));

        if (activeFilters.search?.trim()) {
          params.set("search", activeFilters.search.trim());
        }
        if (activeFilters.sort) {
          params.set("sort", activeFilters.sort);
        }
        if (activeFilters.status) {
          params.set("status", activeFilters.status);
        }

        const { data } = await axios.get(
          `${backendUrl}/api/orders?${params.toString()}`,
          { withCredentials: true }
        );

        if (data?.success) {
          const result = Array.isArray(data?.result) ? data.result : [];
          const pageInfo = data?.pagination || {};

          setOrders(result);
          setPagination({
            page: Number(pageInfo?.page ?? activeFilters.page ?? 1),
            totalPages: Number(pageInfo?.totalPages ?? 1),
            totalItems: Number(pageInfo?.totalItems ?? 0),
            limit: DEFAULT_LIMIT,
          });
        } else {
          setOrders([]);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error loading orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchOrders(filters);
  }, [fetchOrders, filters.page, filters.search, filters.sort, filters.status]);

  const fetchMyOrders = useCallback((page = 1) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setFilters((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const handleSort = useCallback((sortValue) => {
    setFilters((prev) => ({
      ...prev,
      sort: sortValue,
      page: 1,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const handleStatus = useCallback((statusValue) => {
    setFilters((prev) => ({
      ...prev,
      status: statusValue,
      page: 1,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchStats(), fetchOrders(filters)]);
  }, [fetchStats, fetchOrders, filters]);

  return {
    orders,
    loading: loading || statsLoading,
    stats,
    pagination,
    filters,
    fetchMyOrders,
    handleSearch,
    handleSort,
    handleStatus,
    refetch,
  };
};

export default useMyOrders;