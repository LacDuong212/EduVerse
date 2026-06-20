import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export const useAchievements = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [earned, setEarned]   = useState([]);
  const [locked, setLocked]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${backendUrl}/api/badges/me`, {
        withCredentials: true,
      });
      const result = res?.data?.result || {};
      setEarned(result.earned || []);
      setLocked(result.locked || []);
      setStats(result.stats  || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load achievements.");
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return { earned, locked, stats, loading, error, refetch: fetchBadges };
};
