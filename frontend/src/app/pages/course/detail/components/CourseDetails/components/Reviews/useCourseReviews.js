import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function useCourseReviews(initialLimit = 5) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id: courseId } = useParams();

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (pageNum = 1, isAppend = false) => {
    if (!courseId || !backendUrl) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/${courseId}/reviews`, {
        params: { page: pageNum, limit: limit },
        withCredentials: true,
      });

      if (data.success && data.result) {
        const { myReview: fetchedMyReview, reviews: fetchedOtherReviews } = data.result;

        if (pageNum === 1) setMyReview(fetchedMyReview || null);

        setReviews((prev) =>
          isAppend ? [...prev, ...fetchedOtherReviews] : fetchedOtherReviews
        );

        if (data.pagination) {
          setPagination({
            totalPages: data.pagination.totalPages,
            totalItems: data.pagination.totalItems,
            hasNextPage: data.pagination.hasNextPage,
          });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load reviews";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [courseId, backendUrl, limit]);

  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  const submitReview = async (reviewData) => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/reviews`,
        { ...reviewData, courseId },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Review posted!");
        setMyReview(data.result);
        fetchReviews(1, false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  const editReview = async (reviewId, updateData) => {
    setSubmitting(true);
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/reviews/${reviewId}`,
        updateData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Review updated!");
        setMyReview(data.result);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to remove your review?")) return;

    setSubmitting(true);
    try {
      const { status } = await axios.delete(
        `${backendUrl}/api/reviews/${reviewId}`,
        { withCredentials: true }
      );

      if (status === 204 || status === 200) {
        toast.success("Review removed");
        setMyReview(null);
        fetchReviews(1, false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReviews(newPage, false);
  };

  const loadMore = () => {
    if (pagination.hasNextPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage, true);
    }
  };

  return {
    reviews,
    myReview,

    page,
    limit, setLimit,
    pagination,

    loading,
    submitting,
    error,

    submitReview,
    editReview,
    deleteReview,
    handlePageChange,
    loadMore,
    refresh: () => fetchReviews(1, false),
  };
}