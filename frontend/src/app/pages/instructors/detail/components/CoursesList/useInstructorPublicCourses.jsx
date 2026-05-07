import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";
import { mapResponseErrors } from "@/utils/mapper";
import { handleRequest } from "@/utils/request";

export default function useInstructorPublicCourses(insId, limit = 6) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [hasMore, setHasMore] = useState(true);
  const [nextSkip, setNextSkip] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchCourses = useCallback(async (isRefreshing = false) => {
    if (!insId) return;

    if (isRefreshing) setLoading(true);
    else setLoadingMore(true);

    setError(null);

    const currentSkip = isRefreshing ? 0 : nextSkip;

    const response = await handleRequest(api.get(
      `/instructors/${insId}/courses`,
      { params: { limit, skip: currentSkip } }
    ));

    if (response.success) {
      const {
        courses: newCourses,
        hasMore: moreAvailable,
        nextSkip: skipVal,
        total: totalCount
      } = response.result;

      setCourses((prev) => (isRefreshing ? newCourses : [...prev, ...newCourses]));
      setHasMore(moreAvailable);
      setNextSkip(skipVal);
      setTotal(totalCount);
    } else {
      setError(response.message);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [insId, limit, nextSkip]);

  useEffect(() => {
    fetchCourses(true);
  }, [insId]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchCourses(false);
    }
  }, [fetchCourses, loading, loadingMore, hasMore]);

  const refresh = useCallback(() => {
    fetchCourses(true);
  }, [fetchCourses]);

  return {
    courses,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    refresh
  };
}