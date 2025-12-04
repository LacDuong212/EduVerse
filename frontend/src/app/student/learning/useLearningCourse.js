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
    console.log("====================================");
    console.log("[useLearningCourseDetail] START FETCH");
    console.log("[useLearningCourseDetail] courseId:", courseId);
    console.log("[useLearningCourseDetail] backendUrl:", backendUrl);

    if (!courseId || !backendUrl) {
      console.warn("[useLearningCourseDetail] SKIP: Missing param", {
        courseId,
        backendUrl,
      });
      return;
    }

    setLoading(true);
    try {
      const url = `${backendUrl}/api/student/my-courses/${courseId}`;
      console.log("[useLearningCourseDetail] GET:", url);

      const { data } = await axios.get(url, { withCredentials: true });

      console.log("[useLearningCourseDetail] RESPONSE:", data);

      if (data.success) {
        console.log("[useLearningCourseDetail] SET COURSE:", data.course);
        setCourse(data.course);
      } else {
        console.error("[useLearningCourseDetail] Backend returned success=false");
        toast.error(data.message || "Cannot load course");
      }
    } catch (err) {
      console.error("[useLearningCourseDetail] ERROR:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;

      if (status === 404 || status === 403) {
        toast.error("You are not enrolled in this course");
        navigate("/student/courses");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      console.log("[useLearningCourseDetail] END FETCH");
      console.log("====================================");
    }
  }, [courseId, backendUrl, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, reload: fetchCourse };
}
