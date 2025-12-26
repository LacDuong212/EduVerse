import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// helper: map review object from response
function mapReviewFromApi(review) {
  return {
    id: review._id,
    name: review.user?.name || "Student",
    avatar:
      review.user?.pfpImg ||
      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av4_khpvlh.png",
    rating: review.rating ?? 0,
    description: review.description || "",
    time: review.updatedAt || review.createdAt,
  };
}

// helper: calculate review stats
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

export default function useCourseReviews(courseId, options = {}) {
  const { pageSize = 10 } = options;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { userData } = useSelector((state) => state.auth);

  const [userReviews, setUserReviews] = useState([]);
  const [othersReviews, setOthersReviews] = useState([]);
  const [pagination, setPagination] = useState({
    reviewCount: 0,
    page: 1,
    pages: 1,
  });
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolledChecking, setIsEnrolledChecking] = useState(true); // default true to allow check to run

  // check enrollment status
  useEffect(() => {
    if (!courseId) return;

    // if not student
    if (!userData || userData.role?.toLowerCase() !== "student") {
      setIsEnrolled(false);
      setIsEnrolledChecking(false);
      return;
    }

    let cancelled = false;
    const checkEnroll = async () => {
      setIsEnrolledChecking(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/student/my-courses/check/${courseId}`,
          { withCredentials: true }
        );

        if (!cancelled && data?.success) {
          setIsEnrolled(data.isEnrolled);
        }
      } catch (err) {
        if (!cancelled) setIsEnrolled(false);
      } finally {
        if (!cancelled) setIsEnrolledChecking(false);
      }
    };

    checkEnroll();
    return () => { cancelled = true; };
  }, [backendUrl, courseId, userData]);

  // fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!courseId || !backendUrl) return;
    
    // prevent double-fetch
    if (userData && userData.role?.toLowerCase() === "student" && isEnrolledChecking) return;

    setLoading(true);
    try {
      let endpoint = "";
      let config = { params: { page, limit: pageSize } };

      if (isEnrolled) {
        endpoint = `${backendUrl}/api/reviews/user/${courseId}`;
        config.withCredentials = true;
      } else {
        endpoint = `${backendUrl}/api/reviews/${courseId}`;
      }

      const { data } = await axios.get(endpoint, config);

      if (data?.success) {
        if (isEnrolled) {
          setUserReviews((data.userReviews || []).map(mapReviewFromApi));
        } else {
          setUserReviews([]); 
        }
        setOthersReviews((data.othersReviews || []).map(mapReviewFromApi));
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, courseId, page, pageSize, isEnrolled, isEnrolledChecking, userData]);

  // trigger fetch when enrollment status is determined/changes
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculations
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
    userReviews,
    othersReviews,
    allReviews,
    stats,
    pagination,
    page,
    isEnrolled,
    isEnrolledChecking,
    loading,
    actionLoading,
    goToPage,
    createReview,
    updateReview,
    deleteReview,
  };
}