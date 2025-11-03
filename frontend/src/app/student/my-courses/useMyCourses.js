import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const getFirstLectureId = (course) => {
  const sections = Array.isArray(course?.curriculum) ? course.curriculum : [];

  // 1) Ưu tiên lecture free
  for (const sec of sections) {
    const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];
    const free = lecs.find((l) => l?.isFree);
    if (free?._id) return free._id;
  }
  // 2) Không có free → lấy bài đầu tiên
  for (const sec of sections) {
    const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];
    if (lecs.length && lecs[0]?._id) return lecs[0]._id;
  }
  // 3) Không có curriculum → nếu có previewVideo thì dùng 'preview'
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

  const fetchMyCourses = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/courses/my-courses?page=${page}&limit=${pagination.limit}`,
        { withCredentials: true }
      );

      if (data.success) {
        const normalized = (data.courses || []).map((c) => ({
          _id: c._id,
          name: c.title || "Untitled Course",
          image: c.thumbnail || "/images/placeholder.jpg",
          totalLectures: c.lecturesCount ?? c.totalLectures ?? 0,
          completedLectures: 0,
          firstLectureId: getFirstLectureId(c), // 👈 thêm
          hasPreview: !!c.previewVideo,
        }));

        setCourseData(normalized);
        setPagination((prev) => ({
          ...prev,
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
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

  return { courseData, pagination, loading, fetchMyCourses };
};