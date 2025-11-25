import { setLogout, setUserData } from '@/redux/authSlice';

import axios from 'axios';
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
        dispatch(setUserData(data.user));
        toast.success('Profile updated!');

        return { success: true, user: data.user };
      } else {
        toast.error(data.message || 'Something went wrong');
        return { success: false };
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

  return {
    user,
    updateProfile,
    logout,
  };
}
