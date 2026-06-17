import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function useLearningCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId || !backendUrl) return;

    setLoading(true);

    try {
      const url = `${backendUrl}/api/student/courses/${courseId}`;

      const { data } = await axios.get(url, {
        withCredentials: true,
      });

      if (data.success) {
        setCourse(data.result?.course || null);
      } else {
        toast.error(data.message || "Cannot load course");
      }
    } catch (err) {
      console.error("[useLearningCourseDetail] ERROR:", err);

      const status = err.response?.status;
      const errData = err.response?.data;
      const message =
        errData?.message ||
        errData?.error ||
        err.message;

      if (status === 403 && errData?.errors?.isBlocked) {
        toast.error("This course has been permanently blocked.");
        navigate(`/courses/${courseId}`);
        return;
      }

      if (status === 403) {
        toast.error(
          message ||
          "This course is no longer available or you do not have access."
        );
        navigate("/student/courses");
        return;
      }

      if (status === 404) {
        toast.error(message || "Course not found.");
        navigate("/student/courses");
        return;
      }

      toast.error(message || "Cannot load course");
    } finally {
      setLoading(false);
    }
  }, [courseId, backendUrl, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, reload: fetchCourse };
}