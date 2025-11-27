import axios from 'axios';
import { useState, useEffect } from 'react';

const URL_REGEX = /^(https|http):\/\/[^\s$.?#].[^\s]*$/;

export const useVideoStream = (courseId, videoSource) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // reset state when video changes
    setStreamUrl(null);
    setError(null);
    setLoading(true);

    if (!videoSource) {
      setLoading(false);
      return;
    }

    // check if it's already an external URL (YouTube/Vimeo,..)
    if (URL_REGEX.test(videoSource)) {
      setStreamUrl(videoSource);
      setLoading(false);
      return;
    }

    // if it's an S3 key
    const fetchSignedUrl = async () => {
      try {
        // encode videoSource, for safety
        const encodedKey = encodeURIComponent(videoSource);

        const { data } = await axios.get(
          `${backendUrl}/api/courses/${courseId}/videos/${encodedKey}`,
          { withCredentials: true }
        );

        if (data.success) {
          setStreamUrl(data.streamUrl);
        } else {
          setError(data.message || "Failed to load video");
        }
      } catch (err) {
        console.error("Video fetch error:", err);
        setError(err.response?.data?.message || "Error loading video");
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [courseId, videoSource]);

  return { streamUrl, loading, error };
};
