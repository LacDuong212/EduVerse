import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/cartSlice";

export default function useCourseDetail() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchCourse = useCallback(async () => {
        if (!id || !backendUrl) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(`${backendUrl}/api/courses/${id}`);
            if (data && data.success) setCourse(data.course);
            await axios.post(
                `${backendUrl}/api/courses/${id}/viewed`,
                {},
                { withCredentials: true }
            );
        } catch (err) {
            setError(err);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id, backendUrl]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

  const handleAddToCart = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/add`,
        { courseId: id },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setCart(res.data.cart)); // update Redux
        toast.success("Added to cart!");
      } else {
        toast.error(res.data.message || "Failed to add");
      }
    } catch (err) {
      toast.error("Error adding to cart");
      console.error(err);
    }
  };


    // related courses (single effect, guarded)
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
        return () => { cancelled = true; };
    }, [id, backendUrl]);

    return { course, setCourse, loading, error, refetch: fetchCourse, relatedCourses,handleAddToCart };
}