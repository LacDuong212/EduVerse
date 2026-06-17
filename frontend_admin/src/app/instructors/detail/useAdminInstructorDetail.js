import { useCallback, useEffect, useState } from "react";
import { getInstructorDetail, getInstructorDetailStats } from "@/helpers/data";

export default function useAdminInstructorDetail(id) {
  const [instructor, setInstructor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const [profileRes, statsRes] = await Promise.all([
      getInstructorDetail(id),
      getInstructorDetailStats(id),
    ]);

    if (profileRes.success) {
      setInstructor(profileRes.result);
    } else {
      setError(profileRes.message || "Failed to load instructor profile.");
    }

    if (statsRes.success) {
      setStats(statsRes.result);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { instructor, stats, loading, error, refresh: fetchDetail };
}
