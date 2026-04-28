import axios from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

export default function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadVideo = useCallback(async (file, onSuccess) => {
    if (!file) {
      toast.error("No video file selected");
      return null;
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Unsupported format. Please upload MP4, WebM, or OGG.");
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const toastId = toast.loading("Uploading video...");

    try {
      const res = await handleRequest(authApi.post("/videos", { contentType: file.type }));

      if (!res.success)
        throw new Error(res.message || "Failed to get upload permission..");

      const { uploadUrl, videoId } = res.result;

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });

      toast.update(toastId, {
        render: "Video uploaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });

      if (onSuccess) onSuccess(videoId);
      return videoId;

    } catch (err) {
      const errMsg = err.message || "Upload video failed..";
      setError(errMsg);

      toast.update(toastId, {
        render: errMsg,
        type: "error",
        isLoading: false,
        autoClose: 3000
      });

      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadVideo, progress, isUploading, error };
}