import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function useVideoStream(videoId) {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  const fetchStreamUrl = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);
    setStatusCode(null);

    try {
      const res = await handleRequest(authApi.get(`/videos/${videoId}`));

      if (res.success) {
        setStreamUrl(res.result);
      } else {
        setStatusCode(res.statusCode);
        setError(res.message || "Failed to load video..");
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Failed to load video..";
      setStatusCode(status);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    setStreamUrl(null); // must
    fetchStreamUrl();
  }, [fetchStreamUrl]);

  return {
    streamUrl,
    loading,
    error,
    statusCode,
    refetch: fetchStreamUrl,
  };
}