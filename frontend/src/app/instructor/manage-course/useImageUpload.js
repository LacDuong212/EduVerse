import axios from 'axios';
import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = useCallback(async (file, courseId) => {
    if (!file || !courseId) return;   // #TODO: handle when creating no courseId

    setIsUploading(true);
    setError(null);
    setImageUrl(null);

    try {
      const { data: response } = await axios.get(
        `${backendUrl}/api/courses/${courseId}/images/upload`,
        { withCredentials: true }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to get upload permission');
      }

      const { 
        signature, 
        timestamp, 
        folder, 
        public_id, 
        apiKey, 
        cloudName,
        transformation
      } = response.data;

      // upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("public_id", public_id);
      formData.append("overwrite", "true");
      formData.append("transformation", transformation);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const secureUrl = cloudinaryRes.data.secure_url;
      setImageUrl(secureUrl);
      
      return secureUrl;

    } catch (err) {
      console.error("Upload error:", err);
      const errMsg = err.response?.data?.message || err.message || "Upload image failed";
      setError(errMsg);
      throw new Error(errMsg); // re-throw so the component knows it failed
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadImage, isUploading, error, imageUrl };
};