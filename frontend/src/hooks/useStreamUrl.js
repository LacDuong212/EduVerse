import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export const useVideoStream = (videoId) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
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
      const { data } = await axios.get(`${backendUrl}/api/videos/${videoId}`, {
        withCredentials: true,
      });

      if (data.success) {
        setStreamUrl(data.result);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Failed to load video.";

      setStatusCode(status);
      setError(msg);

      if (![403, 404].includes(status)) {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [videoId, backendUrl]);

  useEffect(() => {
    fetchStreamUrl();
  }, [fetchStreamUrl]);

  return { 
    streamUrl, 
    loading, 
    error, 
    statusCode, 
    refetch: fetchStreamUrl 
  };
};