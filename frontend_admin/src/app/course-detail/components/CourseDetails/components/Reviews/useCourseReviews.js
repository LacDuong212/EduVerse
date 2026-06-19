import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function useCourseReviews(initialLimit = 5) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id: courseId } = useParams();

  const [reviews, setReviews] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(
    async (pageNum = 1) => {
      if (!courseId || !backendUrl) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/courses/${courseId}/reviews`,
          {
            params: {
              page: pageNum,
              limit,
            },
            withCredentials: true,
          }
        );

        if (data.success && data.result) {
          const fetchedReviews = data.result.reviews || [];

          setReviews(fetchedReviews);

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
    },
    [courseId, backendUrl, limit]
  );

  useEffect(() => {
    setPage(1);
    fetchReviews(1);
  }, [fetchReviews]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReviews(newPage);
  };

  return {
    reviews,

    page,
    limit,
    setLimit,
    pagination,

    loading,
    error,

    handlePageChange,
    refresh: () => fetchReviews(1),
  };
}