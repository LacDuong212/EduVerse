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
  const [blockedInfo, setBlockedInfo] = useState(null);

  const [refundStatus, setRefundStatus] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

   const fetchRefundStatus = useCallback(async () => {
    if (!id || !backendUrl || !userData) return;

    try {
      const refundRes = await axios.get(
        `${backendUrl}/api/coupons/refund/${id}/status`,
        { withCredentials: true }
      );

      if (refundRes.data.success) {
        setRefundStatus(refundRes.data.result);
      }
    } catch (refundErr) {
      console.error("Failed to fetch refund coupon status:", refundErr);
      setRefundStatus(null);
    }
  }, [id, backendUrl, userData]);

  const fetchData = useCallback(async () => {
    if (!id || !backendUrl) return;

    setLoading(true);
    setError(null);
    setStatusCode(null);
    setBlockedInfo(null);
    setRefundStatus(null);

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

      if (status === 403 && errData?.errors?.isBlocked && userData?.role === "student") {
        setBlockedInfo({
          isBlocked: true,
          message: errData.message,
          courseId: errData.errors.courseId || id,
          courseTitle: errData.errors.courseTitle || "This course",
          reason:
            errData.errors.reason ||
            errData.message ||
            "This course has been permanently blocked.",
          hasEnrollment: !!errData.errors.hasEnrollment
        });

        setCourse(null);
        setRelatedCourses([]);
        setError(null);
        setStatusCode(403);

        if (userData?.role === "student") {
          await fetchRefundStatus();
        }

        return;
      }

      if (status === 400 && errData?.errors) setStatusCode(404);

      const msg = errData?.message || "Something went wrong";
      setError(msg);

    } finally {
      setLoading(false);
    }
  }, [id, backendUrl, userData, fetchRefundStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaimRefund = async () => {
    if (!userData) {
      return toast.info("Please login to claim your refund coupon.");
    }

    if (userData.role !== "student") {
      return toast.warning("Only students can claim refund coupons.");
    }

    if (!blockedInfo?.hasEnrollment) {
      return toast.warning(
        "Refund coupons are only available to students who joined this course."
      );
    }

    if (refundStatus?.claimed) {
      return toast.info("You have already claimed this refund coupon.");
    }

    if (refundStatus?.expired) {
      return toast.error("This refund coupon has expired.");
    }

    try {
      setRefundLoading(true);

      const res = await axios.post(
        `${backendUrl}/api/coupons/refund/${id}/claim`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(
          res.data.message ||
            "Refund coupon claimed. You will receive a notification in 60 seconds."
        );

        setRefundStatus({
          exists: true,
          claimed: true,
          expired: false,
          coupon: res.data.result?.coupon || null
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to claim refund coupon."
      );
    } finally {
      setRefundLoading(false);
    }
  };

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
    blockedInfo,

    refundStatus,
    refundLoading,
    handleClaimRefund,

    handleAddToCart,
    isOwned: !!course?.isOwned,
    refetch: fetchData,
  };
}