import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "@/redux/cartSlice";

export default function useCourseDetail() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();
  const { id } = useParams();

  const { userData } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      const [courseRes, relatedRes] = await Promise.all([
        axios.get(`${backendUrl}/api/courses/${id}`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/courses/${id}/related`)
      ]);

      let courseData = null;
      if (courseRes.data.success) {
        courseData = courseRes.data.result;
        const insId = courseData.instructor?.insId;

        if (insId) {
          try {
            const statsRes = await axios.get(`${backendUrl}/api/instructors/${insId}/stats`);
            if (statsRes.data.success) {
              courseData.instructor.stats = statsRes.data.result;
            }
          } catch (statsErr) {
            console.error("Failed to fetch instructor stats:", statsErr);
          }
        }

        setCourse(courseData);
      }

      if (relatedRes.data.success) {
        setRelatedCourses(relatedRes.data.result.courses || []);
      }
    } catch (err) {
      const errData = err.response?.data;

      const status = err.response?.status;
      setStatusCode(status);

      if (err.response?.data?.errors) setStatusCode(404);

      const msg = errData?.message || "Something went wrong";
      setError(msg);

    } finally {
      setLoading(false);
    }
  }, [id, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = async () => {
    if (!userData) return toast.info("Please login to add to cart.");
    if (userData.role !== "student") return toast.warning("Action cannot be done by instructors.");
    if (course?.isOwned) return toast.info("You already own this course.");

    try {
      await dispatch(addToCart({ courseId: id })).unwrap();
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err || "Failed to add to cart..");
    }
  };

  return {
    course,
    relatedCourses,

    loading,
    error,
    statusCode,

    handleAddToCart,
    isOwned: !!course?.isOwned,
    refetch: fetchData,
  };
}