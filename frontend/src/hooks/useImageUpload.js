import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

export default function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToCloudinary = async (file, uploadParams) => {
    const {
      signature,
      timestamp,
      public_id,
      folder,
      transformation,
      apiKey,
      cloudName
    } = uploadParams;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", public_id);
    formData.append("transformation", transformation);
    formData.append("overwrite", "true");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await axios.post(cloudinaryUrl, formData, {
      onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
    });

    return response.data.secure_url;
  };

  const uploadCourseImage = async (courseId, file) => {
    if (!file) return null;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await handleRequest(authApi.get(`/courses/${courseId}/image/upload`));

      if (res.success) {
        const imageUrl = await uploadToCloudinary(file, res.result);
        toast.success("Course image uploaded!");
        return imageUrl;
      } else {
        toast.error(res.message || "Image upload failed..");
        return null;
      }
    } catch (err) {
      console.log("[ERR]:", err);
      toast.error("Image upload failed..");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return null;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await handleRequest(authApi.get(`/user/avatar/upload`));

      if (res.success) {
        const avatarUrl = await uploadToCloudinary(file, res.result);
        toast.success("Avatar updated!");
        return avatarUrl;
      } else {
        toast.error(res.message || "Avatar upload failed..");
        return null;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Avatar upload failed..");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadCourseImage,
    uploadAvatar,

    isUploading,
    uploadProgress,
  };
}