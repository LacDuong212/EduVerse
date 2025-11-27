import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function mapReviewFromApi(review) {
  return {
    id: review._id,
    name: review.user?.name || "Student",
    avatar:
      review.user?.pfpImg ||
      "/images/avatar-placeholder.png", // TODO: đổi path theo project
    rating: review.rating ?? 0,
    description: review.description || "",
    time: review.updatedAt || review.createdAt,
  };
}

function computeStats(reviews) {
  const total = reviews.length;
  if (!total) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    const rating = Number(r.rating) || 0;
    const star = Math.round(rating);
    if (star >= 1 && star <= 5) distribution[star] += 1;
    sum += rating;
  });

  return {
    averageRating: sum / total,
    totalReviews: total,
    distribution,
  };
}

/**
 * Hook cho toàn bộ logic review của 1 course:
 * - GET /api/reviews/user/:courseId (nếu login) / fallback /:courseId (guest)
 * - POST /api/reviews
 * - PATCH /api/reviews/:reviewId
 * - DELETE /api/reviews/:reviewId
 */
export default function useCourseReviews(courseId, options = {}) {
  const { pageSize = 10 } = options;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userReviews, setUserReviews] = useState([]);
  const [othersReviews, setOthersReviews] = useState([]);
  const [pagination, setPagination] = useState({
    reviewCount: 0,
    page: 1,
    pages: 1,
  });
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);        // load list
  const [actionLoading, setActionLoading] = useState(false); // create/update/delete
  const [error, setError] = useState(null);

  // ✅ NEW: trạng thái enroll (đã mua / đã học) course này chưa
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolledChecking, setIsEnrolledChecking] = useState(false);

  // ✅ NEW: check xem user có sở hữu course không
  useEffect(() => {
    if (!courseId || !backendUrl) return;

    let cancelled = false;

    const checkEnroll = async () => {
      setIsEnrolledChecking(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/student/my-courses/${courseId}`,
          { withCredentials: true }
        );

        if (cancelled) return;

        if (data?.success && data.course) {
          setIsEnrolled(true);
        } else {
          setIsEnrolled(false);
        }
      } catch (err) {
        if (cancelled) return;
        // 401/403 hoặc lỗi khác -> coi như chưa enroll / guest
        setIsEnrolled(false);
      } finally {
        if (!cancelled) setIsEnrolledChecking(false);
      }
    };

    checkEnroll();

    return () => {
      cancelled = true;
    };
  }, [backendUrl, courseId]);

  const fetchReviews = useCallback(async () => {
    if (!courseId || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ cố gắng dùng endpoint user (có auth)
      const urlUser = `${backendUrl}/api/reviews/user/${courseId}`;
      const resUser = await axios.get(urlUser, {
        params: { page, limit: pageSize },
        withCredentials: true,
      });

      if (resUser.data?.success) {
        const {
          userReviews: user = [],
          othersReviews: others = [],
          pagination: pag,
        } = resUser.data;

        setUserReviews(user.map(mapReviewFromApi));
        setOthersReviews(others.map(mapReviewFromApi));
        if (pag) setPagination(pag);
      } else {
        // success=false nhưng vẫn 200 => fallback guest
        const urlGuest = `${backendUrl}/api/reviews/${courseId}`;
        const resGuest = await axios.get(urlGuest, {
          params: { page, limit: pageSize },
        });

        if (resGuest.data?.success) {
          const {
            othersReviews: others = [],
            pagination: pag,
          } = resGuest.data;
          setUserReviews([]);
          setOthersReviews(others.map(mapReviewFromApi));
          if (pag) setPagination(pag);
        }
      }
    } catch (err) {
      // 2️⃣ lỗi auth => dùng endpoint guest
      if (err.response?.status === 401 || err.response?.status === 403) {
        try {
          const urlGuest = `${backendUrl}/api/reviews/${courseId}`;
          const resGuest = await axios.get(urlGuest, {
            params: { page, limit: pageSize },
          });

          if (resGuest.data?.success) {
            const {
              othersReviews: others = [],
              pagination: pag,
            } = resGuest.data;
            setUserReviews([]);
            setOthersReviews(others.map(mapReviewFromApi));
            if (pag) setPagination(pag);
          }
        } catch (guestErr) {
          setError(guestErr);
        }
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl, courseId, page, pageSize]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const allReviews = [...userReviews, ...othersReviews];
  const stats = computeStats(allReviews);

  const goToPage = (nextPage) => {
    if (nextPage >= 1 && nextPage <= pagination.pages) {
      setPage(nextPage);
    }
  };

  // ========== ACTIONS ==========

  const createReview = async ({ rating, description }) => {
    if (!courseId) return { success: false };

    // ✅ NEW: chặn luôn từ frontend nếu chưa enroll
    if (!isEnrolled) {
      toast.error("You must enroll in this course before leaving a review.");
      return { success: false };
    }

    try {
      setActionLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/reviews`,
        { courseId, rating, description },
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error(data.message || "Failed to post review");
        return { success: false };
      }

      toast.success("Review posted!");
      await fetchReviews();
      return { success: true, review: data.review };
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating review");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  };

  const updateReview = async (reviewId, { rating, description }) => {
    try {
      setActionLoading(true);
      const { data } = await axios.patch(
        `${backendUrl}/api/reviews/${reviewId}`,
        { rating, description },
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error(data.message || "Failed to update review");
        return { success: false };
      }

      toast.success("Review updated!");
      await fetchReviews();
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating review");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      setActionLoading(true);
      const { data } = await axios.delete(
        `${backendUrl}/api/reviews/${reviewId}`,
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error(data.message || "Failed to delete review");
        return { success: false };
      }

      toast.success("Review deleted!");
      await fetchReviews();
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting review");
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    // data
    userReviews,
    othersReviews,
    allReviews,
    stats,          // { averageRating, totalReviews, distribution }
    pagination,
    page,
    isEnrolled,          // ✅ NEW: export cho component dùng
    isEnrolledChecking,  // ✅ NEW: export nếu UI muốn show loading

    // loading & error
    loading,
    actionLoading,
    error,

    // actions
    goToPage,
    createReview,
    updateReview,
    deleteReview,
  };
}
