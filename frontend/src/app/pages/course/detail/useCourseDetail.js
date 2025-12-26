import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { addToCart } from "@/redux/cartSlice";

export default function useCourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { userData } = useSelector((state) => state.auth);

  // state ---
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [owned, setOwned] = useState(false);
  const [ownedChecking, setOwnedChecking] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);

  // fetch course details (PUBLIC)
  const fetchCourse = useCallback(async (signal) => {
    if (!id || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      // pass signal to axios to allow cancellation
      const config = signal ? { signal } : {}; 
      const { data } = await axios.get(`${backendUrl}/api/courses/${id}`, config);

      if (data && data.success) {
        setCourse(data.course);
      } else {
        throw new Error(data?.message || "Cannot fetch course");
      }
    } catch (err) {
      // ignore errors caused by cancelling the request (navigating away)
      if (axios.isCancel(err)) return;
      
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, backendUrl]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCourse(controller.signal);
    
    // cleanup: cancels the request if component unmounts or id changes
    return () => controller.abort();
  }, [fetchCourse]);

  // check ownership (PRIVATE)
  const checkOwned = useCallback(async (signal) => {
    if (!userData?._id || userData?.role.toLowerCase() !== "student" || !id || !backendUrl) {
      setOwned(false);
      setOwnedChecking(false);
      return;
    }

    setOwnedChecking(true);
    try {
      const config = { 
        withCredentials: true,
        ...(signal ? { signal } : {})
      };
      
      const { data } = await axios.get(
        `${backendUrl}/api/student/my-courses/${id}`,
        config
      );

      setOwned(!!(data?.success && data.course));
    } catch (err) {
      if (axios.isCancel(err)) return;
      setOwned(false);
    } finally {
      setOwnedChecking(false);
    }
  }, [id, backendUrl, userData?._id]);

  useEffect(() => {
    const controller = new AbortController();
    checkOwned(controller.signal);
    return () => controller.abort();
  }, [checkOwned]);

  // fetch related courses (PUBLIC)
  useEffect(() => {
    if (!id || !backendUrl) {
      setRelatedCourses([]);
      return;
    }

    const controller = new AbortController();

    const fetchRelated = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/courses/${id}/related`,
          { signal: controller.signal }
        );
        if (data && data.success) {
          setRelatedCourses(data.courses || []);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Failed to fetch related courses", err);
        }
      }
    };

    fetchRelated();

    return () => controller.abort();
  }, [id, backendUrl]);

  // cart action
  const handleAddToCart = async () => {
    if (!userData?._id) {
      toast.info("Please login to add to cart");
      return;
    }

    if (userData?.role.toLowerCase() !== "student" ) {
      toast.warning("You cannot perform this action");
      return;
    }

    if (owned) {
      toast.info("You already own this course");
      return;
    }

    try {
      await dispatch(addToCart({ courseId: id })).unwrap();
      toast.success("Added to cart!");
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.message || "Failed to add to cart");
      
      toast.error(errorMessage);
      console.error("Add to cart failed:", err);
    }
  };

  return {
    course,
    setCourse,
    loading,
    error,
    refetch: () => fetchCourse(), 
    relatedCourses,
    handleAddToCart,
    owned,
    ownedChecking,
  };
}