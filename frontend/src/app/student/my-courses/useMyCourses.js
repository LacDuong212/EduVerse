// useMyCourses.js
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const getFirstLectureId = (course) => {
  const sections = Array.isArray(course?.curriculum) ? course.curriculum : [];
  for (const sec of sections) {
    const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];
    const free = lecs.find((l) => l?.isFree);
    if (free?._id) return free._id;
  }
  for (const sec of sections) {
    const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];
    if (lecs.length && lecs[0]?._id) return lecs[0]._id;
  }
  if (course?.previewVideo) return "preview";
  return null;
};

export const useMyCourses = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 8,
  });

  // 👉 stats cho Counter
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
  });

  const fetchMyCourses = async (_page = 1) => {
    try {
      setLoading(true);

      // ✅ ĐÚNG: /api/students/my-courses (có "s")
      const { data } = await axios.get(
        `${backendUrl}/api/student/my-courses`,
        { withCredentials: true }
      );

      if (data.success) {
        const normalized = (data.courses || []).map((c) => ({
          _id: c._id,
          name: c.title || "Untitled Course",
          image: c.thumbnail || "/images/placeholder.jpg",
          totalLectures: c.lecturesCount ?? c.totalLectures ?? 0,
          completedLectures: 0,
          firstLectureId: getFirstLectureId(c),
          hasPreview: !!c.previewVideo,
        }));

        setCourseData(normalized);

        // 👉 dùng stats từ backend
        const totalCourses = data.stats?.totalCourses ?? normalized.length;
        const completedCourses = data.stats?.completedCourses ?? 0;
        const inProgressCourses =
          data.stats?.inProgressCourses ??
          Math.max(0, totalCourses - completedCourses);

        setStats({
          total: totalCourses,
          completed: completedCourses,
          inProgress: inProgressCourses,
        });

        // giữ pagination cho UI cũ nhưng 1 trang
        setPagination({
          page: 1,
          total: totalCourses,
          limit: normalized.length || 8,
          totalPages: 1,
        });
      } else {
        toast.error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading courses");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyCourses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { courseData, pagination, loading, fetchMyCourses, stats };
};
