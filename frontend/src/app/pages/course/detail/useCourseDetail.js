import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "@/redux/cartSlice";

export default function useCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 🔹 lấy user để biết đã login hay chưa
  const user = useSelector((state) => state.auth.userData);

  // 👉 state kiểm tra sở hữu
  const [owned, setOwned] = useState(false);
  const [ownedChecking, setOwnedChecking] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!id || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      // 🔹 API public: luôn gọi được cho guest
      const { data } = await axios.get(`${backendUrl}/api/courses/${id}`);
      if (data && data.success) setCourse(data.course);
    } catch (err) {
      // ❗ chỉ coi lỗi GET course là lỗi thật
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }

    // 🔹 ghi nhận lượt xem: chỉ gọi nếu user đã login
    if (user) {
      try {
        await axios.post(
          `${backendUrl}/api/courses/${id}/viewed`,
          {},
          { withCredentials: true }
        );
      } catch (err) {
        // 401/403 thì bỏ qua, không ảnh hưởng UI
        const status = err?.response?.status;
        if (status !== 401 && status !== 403) {
          console.warn("Failed to mark course as viewed:", err);
        }
      }
    }
  }, [id, backendUrl, user]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // 👉 check xem user đã mua course này chưa (chỉ khi login)
  const checkOwned = useCallback(async () => {
    if (!id || !backendUrl) return;

    // chưa login -> chắc chắn chưa sở hữu, KHÔNG gọi API
    if (!user) {
      setOwned(false);
      setOwnedChecking(false);
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
      // 401 / 403 / 404 => coi như chưa sở hữu
      setOwned(false);
    } finally {
      setOwnedChecking(false);
    }
  }, [id, backendUrl, user]);

  useEffect(() => {
    checkOwned();
  }, [checkOwned]);

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
