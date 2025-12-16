// src/hooks/useHomeCourses.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setHomeCourses, setAllCourses } from "@/redux/coursesSlice";

export default function useHomeCourses() {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  // Guard double-call ở React Strict Mode
  const hasFetchedRef = useRef(false);

  // --- helper: fetch ALL pages /api/courses ---
  const fetchAllCourses = useCallback(
    async (signal) => {
      let page = 1;
      const merged = [];

      while (true) {
        const res = await axios.get(`${backendUrl}/api/courses?page=${page}`, {
          withCredentials: true,
          signal,
          timeout: 15000,
        });

        // API shape: { success, data: [...], pagination: { total, page, totalPages } }
        const chunk = Array.isArray(res?.data?.data) ? res.data.data : [];
        merged.push(...chunk);

        const pg = res?.data?.pagination || {};
        if (!pg?.totalPages || page >= Number(pg.totalPages)) break;
        page += 1;
      }

      return merged;
    },
    [backendUrl]
  );

  const fetchOnce = useCallback(
    async (signal) => {
      if (!backendUrl) {
        const msg = "VITE_BACKEND_URL is missing";
        setError(msg);
        toast.error(msg);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1) Khối Home (newest/bestSellers/topRated/biggestDiscounts)
        const resHome = await axios.get(`${backendUrl}/api/courses/home`, {
          withCredentials: true,
          signal,
          timeout: 15000,
        });

        const home = resHome?.data || {};
        const homePayload = {
          newest: Array.isArray(home.newest) ? home.newest : [],
          bestSellers: Array.isArray(home.bestSellers) ? home.bestSellers : [],
          topRated: Array.isArray(home.topRated) ? home.topRated : [],
          biggestDiscounts: Array.isArray(home.biggestDiscounts) ? home.biggestDiscounts : [],
        };
        dispatch(setHomeCourses(homePayload));

        // 2) Full list (đếm đúng tổng, ví dụ 21)
        try {
          const all = await fetchAllCourses(signal);
          dispatch(setAllCourses(all));
        } catch (allErr) {
          console.warn("Fetching all /api/courses failed:", allErr);
          dispatch(setAllCourses([]));
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        const msg = err?.response?.data?.message || err?.message || "Error fetching home courses";
        setError(msg);
        toast.error(msg);

        // Đảm bảo UI không crash
        dispatch(setHomeCourses({ newest: [], bestSellers: [], topRated: [], biggestDiscounts: [] }));
        dispatch(setAllCourses([]));
      } finally {
        setLoading(false);
      }
    },
    [backendUrl, dispatch, fetchAllCourses]
  );

  // Tự fetch khi mount (1 lần)
  useEffect(() => {
    if (hasFetchedRef.current) return; // Guard Strict Mode
    hasFetchedRef.current = true;

    const ac = new AbortController();
    fetchOnce(ac.signal);
    return () => ac.abort();
  }, [fetchOnce]);

  // Cho phép refetch thủ công nếu cần
  const refetch = useCallback(() => {
    const ac = new AbortController();
    fetchOnce(ac.signal);
    return () => ac.abort();
  }, [fetchOnce]);

  return { loading, error, refetch };
}
