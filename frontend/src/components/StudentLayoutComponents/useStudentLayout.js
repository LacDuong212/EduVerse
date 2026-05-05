import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const useStudentStats = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [loading, setLoading] = useState(true);
    const [studentStats, setStudentStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        totalLectures: 0,
        completedLectures: 0,
    });

    const fetchStudentStats = useCallback(async () => {
        try {
            setLoading(true);

            const { data } = await axios.get(`${backendUrl}/api/student/stats`, {
                withCredentials: true,
            });

            if (!data?.success) {
                toast.error(data?.message || "Failed to fetch student stats");
                return;
            }

            const payload = data?.result || {};

            setStudentStats({
                totalCourses: Number(payload?.totalCourses || 0),
                completedCourses: Number(payload?.completedCourses || 0),
                totalLectures: Number(payload?.totalLectures || 0),
                completedLectures: Number(payload?.completedLectures || 0),
            });
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Error loading student stats"
            );
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    useEffect(() => {
        fetchStudentStats();
    }, [fetchStudentStats]);

    return {
        studentStats,
        loading,
        fetchStudentStats,
    };
};

export const useLearningStreak = () => {
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
        setStreak(data.result);
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
};