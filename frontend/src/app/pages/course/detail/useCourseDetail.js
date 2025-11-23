import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "@/redux/cartSlice";

export default function useCourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { userData } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [owned, setOwned] = useState(false);
  const [ownedChecking, setOwnedChecking] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!id || !backendUrl) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/${id}`);
      if (data && data.success) setCourse(data.course);

      if (userData?._id) {
        await axios.post(
          `${backendUrl}/api/courses/${id}/viewed`,
          {},
          { withCredentials: true }
        );
      }
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, backendUrl, userData?._id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const checkOwned = useCallback(async () => {
    if (!id || !backendUrl || !userData?._id) {
      setOwned(false);
      return;
    }

    setOwnedChecking(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/student/my-courses/${id}`,
        { withCredentials: true }
      );

      if (data?.success && data.course) {
        setOwned(true);
      } else {
        setOwned(false);
      }
    } catch (err) {
      setOwned(false);
    } finally {
      setOwnedChecking(false);
    }
  }, [id, backendUrl, userData?._id]);

  useEffect(() => {
    checkOwned();
  }, [checkOwned]);

  const handleAddToCart = async () => {
    if (!userData?._id) {
      toast.info("Please login to add to cart");
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
      const errorMessage = err?.message || (typeof err === 'string' ? err : "Failed to add to cart");

      toast.error(errorMessage);
      console.error("Add to cart failed:", err);
    }
  };

  const [relatedCourses, setRelatedCourses] = useState([]);
  useEffect(() => {
    if (!id || !backendUrl) {
      setRelatedCourses([]);
      return;
    }
    let cancelled = false;
    const fetchRelated = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/courses/${id}/related`
        );
        if (!cancelled && data && data.success) {
          setRelatedCourses(data.courses || []);
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch related courses", err);
      }
    };
    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [id, backendUrl]);

  return {
    course,
    setCourse,
    loading,
    error,
    refetch: fetchCourse,
    relatedCourses,
    handleAddToCart,
    owned,
    ownedChecking,
  };
}
