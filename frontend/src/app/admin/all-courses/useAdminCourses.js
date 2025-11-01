import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";


export default function useAdminCourses() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const admin = useSelector((state) => state.auth.userData);

  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({
    totalCourses: 0,
    activatedCourses: 0,
    pendingCourses: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const fetchCourses = async (page = 1, limit = 10) => {
    if (!admin?._id) {
      toast.warn("Admin not logged in");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/courses/overview?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      if (data.success) {
        setCourses(data.data);
        setMeta(data.meta);
      } else {
        toast.error(data.message || "Failed to load courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    courses,
    meta,
    loading,
    fetchCourses,
  };
}
