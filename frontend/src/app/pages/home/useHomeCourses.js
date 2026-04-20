import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setHomeCourses, setAllCourses, setRecommendedCourses } from "@/redux/coursesSlice";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const useHomeCourses = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);

  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasFetchedPublic = useRef(false);

  const fetchHomeSections = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/courses/home`, { withCredentials: true });
      const { result, success } = res.data;

      if (success && result) {
        dispatch(setHomeCourses({
          newest: result.newest || [],
          bestSellers: result.bestSellers || [],
          topRated: result.topRated || [],
          biggestDiscounts: result.biggestDiscounts || [],
        }));
      }
    } catch (err) {
      console.error("Home sections error:", err);
      setError(err.response?.data?.message || "Failed to load featured courses");
    }
  }, [dispatch]);

  const fetchAllPaginated = useCallback(async () => {
    let currentPage = 1;
    let totalPages = 1;
    const allCourses = [];

    try {
      do {
        const res = await axios.get(`${backendUrl}/api/courses?page=${currentPage}`, {
          withCredentials: true,
          timeout: 15000,
        });

        const { result, pagination } = res.data;
        
        if (Array.isArray(result)) {
          allCourses.push(...result);
        }

        totalPages = pagination?.totalPages || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      dispatch(setAllCourses(allCourses));
    } catch (err) {
      console.error("Pagination fetch error:", err);
      toast.error(err.response?.data?.message || "Error syncing full catalog");
    }
  }, [dispatch]);

  const fetchRecommendations = useCallback(async () => {
    if (!user || user.role !== 'student') {
      dispatch(setRecommendedCourses([]));
      return;
    }

    setRecLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/courses/recommendations`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setRecommendedCourses(res.data.result.courses || []));
      }
    } catch (err) {
      console.warn("Recommendations skipped:", err.response?.data?.message);
      dispatch(setRecommendedCourses([]));
    } finally {
      setRecLoading(false);
    }
  }, [dispatch, user]);

  const initData = useCallback(async () => {
    if (hasFetchedPublic.current) return;
    hasFetchedPublic.current = true;

    setLoading(true);
    setError(null);
    
    await Promise.all([fetchHomeSections(), fetchAllPaginated()]);
    setLoading(false);
  }, [fetchHomeSections, fetchAllPaginated]);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const refetch = () => {
    hasFetchedPublic.current = false;
    initData();
    fetchRecommendations();
  };

  return { 
    loading: loading || recLoading, 
    error, 
    refetch 
  };
};

export default useHomeCourses;