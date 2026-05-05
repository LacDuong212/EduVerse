import { useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { mapResponseErrors } from "@/utils/mapper";
import { handleRequest } from "@/utils/request";

export default function useInstructorPublicDetails(insId) {
  const [instructor, setInstructor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInstructor = useCallback(async () => {
    if (!insId) return;

    setLoading(true);
    setError(null);

    const detailsRes = await handleRequest(api.get(`/instructors/${insId}`));
    const statsRes = await handleRequest(api.get(`/instructors/${insId}/stats`));

    if (detailsRes.success) {
      setInstructor(detailsRes.result);
    } else {
      setError({
        message: detailsRes.message,
        statusCode: detailsRes.statusCode,
        errors: mapResponseErrors(detailsRes.errors)
      });
    }

    if (statsRes.success) {
      setStats(statsRes.result);
    } else {
      setError({
        message: statsRes.message,
        statusCode: statsRes.statusCode,
        errors: mapResponseErrors(statsRes.errors)
      });
    }

    setLoading(false);
  }, [insId]);

  useEffect(() => {
    fetchInstructor();
  }, [fetchInstructor]);

  return {
    instructor,
    stats,
    loading,
    error,
    refresh: fetchInstructor
  };
}