import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setHomeCourses, setAllCourses, setRecommendedCourses } from "@/redux/coursesSlice";

export default function useHomeCourses() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false); 
  const [error, setError] = useState(null);

  const publicDataFetchedRef = useRef(false);

  const fetchPublicData = useCallback(async () => {
    if (publicDataFetchedRef.current) return;
    
    publicDataFetchedRef.current = true;
    
    setLoading(true);
    try {
      const resHome = await axios.get(`${backendUrl}/api/courses/home`, {
        withCredentials: true,
      });
      const home = resHome?.data || {};
      dispatch(setHomeCourses({
           newest: home.newest || [],
           bestSellers: home.bestSellers || [],
           topRated: home.topRated || [],
           biggestDiscounts: home.biggestDiscounts || [],
      }));

      let page = 1;
      const merged = [];
      while (true) {
        const res = await axios.get(`${backendUrl}/api/courses?page=${page}`, {
           withCredentials: true,
           timeout: 15000,
        });
        const chunk = Array.isArray(res?.data?.data) ? res.data.data : [];
        merged.push(...chunk);
        
        const pg = res?.data?.pagination || {};
        if (!pg?.totalPages || page >= Number(pg.totalPages)) break;
        page += 1;
      }
      dispatch(setAllCourses(merged));

    } catch (err) {
      console.error("Public fetch error:", err);
      toast.error("Could not load some courses");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, dispatch]);


  const fetchRecommendations = useCallback(async () => {
    if (!user || user.role !== 'student') {
        dispatch(setRecommendedCourses([]));
        return;
    }

    setRecLoading(true);
    try {
        const resRec = await axios.get(`${backendUrl}/api/courses/recommendations`, {
            withCredentials: true,
        });
        
        if (resRec.data.success) {
            dispatch(setRecommendedCourses(resRec.data.courses));
        }
    } catch (recErr) {
        console.warn("Failed to fetch recommendations:", recErr);
        dispatch(setRecommendedCourses([]));
    } finally {
        setRecLoading(false);
    }
  }, [backendUrl, dispatch, user]);

  useEffect(() => {
    if (backendUrl) {
        fetchPublicData();
    }
  }, [fetchPublicData, backendUrl]);

  useEffect(() => {
    if (backendUrl) {
        fetchRecommendations();
    }
  }, [fetchRecommendations, backendUrl]);

  const refetch = useCallback(() => {
    publicDataFetchedRef.current = false;
    fetchPublicData();
    fetchRecommendations();
  }, [fetchPublicData, fetchRecommendations]);

  return { loading: loading || recLoading, error, refetch };
}