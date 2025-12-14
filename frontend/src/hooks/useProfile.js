import { setLogout } from '@/redux/authSlice';

import axios from 'axios';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function useProfile() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.userData);

  const updateProfile = async (updates) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/user/profile`,
        updates,
        { withCredentials: true }
      );

      if (data.success) {
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error when calling logout API:", error);
    } finally {
      dispatch(setLogout());
      window.location.href = '/';
      toast.success('Log out successfully');
    }
  };
  
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const uploadAvatar = useCallback(async (file) => {
    if (!file) return;

    setIsAvatarUploading(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/user/avatar/upload`,
        { withCredentials: true }
      );
      
      if (!response.data.success) toast.error(response.data.message || "Failed to upload avatar");

      const { signature, timestamp, folder, public_id, transformation, apiKey, cloudName } = response.data.uploadData;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('public_id', public_id);
      formData.append("overwrite", "true");
      formData.append('transformation', transformation);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const newAvatarUrl = cloudinaryRes.data.secure_url;

      return newAvatarUrl;

    } catch (error) {
      console.error("Avatar upload failed:", error);
      throw new Error("Failed to upload avatar");
    } finally {
      setIsAvatarUploading(false);
    }
  }, []);

  return {
    user,
    updateProfile,
    logout,

    uploadAvatar,
    isAvatarUploading,
  };
}
