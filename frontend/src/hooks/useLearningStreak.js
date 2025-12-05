      // src/hooks/useLearningStreak.js
  import { useCallback, useEffect, useState } from "react";
  import axios from "axios";

  export default function useLearningStreak() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStreak = useCallback(async () => {
      if (!backendUrl) {
        console.warn("[useLearningStreak] Missing VITE_BACKEND_URL");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(`${backendUrl}/api/student/streak`, {
          withCredentials: true,
        });

        if (data?.success) {
          setStreak(data.streak);
        } else {
          setStreak({
            currentStreak: 0,
            longestStreak: 0,
            todayDone: false,
            activeDates: [],
          });
        }
      } catch (err) {
        console.error("[useLearningStreak] error", err);

        // nếu chưa login thì coi như không có streak, không spam error
        if (err?.response?.status === 401) {
          setStreak(null);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }, [backendUrl]);

    useEffect(() => {
      fetchStreak();
    }, [fetchStreak]);

    return {
      streak,
      loading,
      error,
      refetch: fetchStreak,
    };
  }
