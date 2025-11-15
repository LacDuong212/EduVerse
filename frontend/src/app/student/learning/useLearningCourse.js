// useLearningCourseDetail.js
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function useLearningCourseDetail() {
  // 🔥 Lấy đúng tên param theo route: /student/courses/:courseId
  const { courseId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !backendUrl) return;

    setLoading(true);
    try {
      // 🔥 Gọi đúng API backend của bạn
      const { data } = await axios.get(
        `${backendUrl}/api/student/my-courses/${courseId}`,
        { withCredentials: true }
      );

      if (data.success) {
        setCourse(data.course);
      } else {
        toast.error(data.message || "Cannot load course");
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        toast.error("You are not enrolled in this course");
        navigate("/student/courses");
      } else {
        toast.error(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, backendUrl, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, reload: fetchCourse };
}
