import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

export const useVideoUpload = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadVideo = async (file, onSuccess) => {
    setIsUploading(true);
    setProgress(0);

    // create a toast ID so we can update it if we want, or just prevent duplicates
    const toastId = toast.loading("Preparing upload...");

    try {
      // check size
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        throw new Error("File is too large, maximum size is 2GB");
      }

      // check extension
      const allowedExts = ["mp4", "mov", "mkv", "avi"];
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        throw new Error(`Invalid file type, allowed: ${allowedExts.join(", ")}`);
      }

      // get upload url
      const { data } = await axios.post(
        `${backendUrl}/api/instructor/videos/upload`,
        {
          fileName: file.name,
          contentType: file.type,
          tags: [{ Key: "status", Value: "boss" }],
        },
        { withCredentials: true }
      );

      if (!data.success) throw new Error(data.message);

      const { uploadUrl, key } = data;

      // update toast to say "Uploading"
      toast.update(toastId, { render: "Uploading to S3...", type: "info", isLoading: true });

      // create a clean Axios instance to avoid sending Auth headers to S3
      const s3Axios = axios.create();
      delete s3Axios.defaults.headers.common['Authorization'];
      s3Axios.defaults.withCredentials = false;

      await s3Axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      toast.update(toastId, {
        render: "Video uploaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      if (onSuccess) onSuccess(key);

    } catch (err) {
      console.error("Upload failed", err);
      const errorMessage = err.response?.data?.message || err.message || "Upload failed";

      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadVideo, progress, isUploading };
};
