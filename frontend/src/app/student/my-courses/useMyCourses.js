import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";


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
        const normalized = data.courses.map((c) => ({
          _id: c._id,
          name: c.title || "Untitled Course",
          image: c.thumbnail || "/images/placeholder.jpg",
          totalLectures: c.totalLectures || 0,
          completedLectures: 0,
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
    fetchMyCourses(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { courseData, pagination, loading, fetchMyCourses };
};
