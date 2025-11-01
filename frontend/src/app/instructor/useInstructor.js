import axios from 'axios';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';


const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function useInstructor() {
  const userId = useSelector((state) => state.auth.userData?._id);

  const fetchPublicFields = async (fields) => {
    if (!userId) {
      toast.error('User not logged in');
      return null;
    }

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructors/${userId}?fields=${fields.join(',')}`
      );

      if (data?.success) return data.instructor;
      toast.error('Failed to fetch instructor data');
      return null;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch instructor data');
      return null;
    }
  };

  const fetchPrivateFields = async (fields) => {
    if (!userId) {
      toast.error('User not logged in');
      return null;
    }

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor?fields=${fields.join(',')}`,
        { withCredentials: true }
      );

      if (data?.success) return data.instructor;
      toast.error('Failed to fetch instructor data');
      return null;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch instructor data');
      return null;
    }
  };

  const fetchCourses = useCallback(async (page, limit) => {
    if (!userId) return null;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/courses?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      if (data?.success) return data;
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [userId]);

  return { fetchPublicFields, fetchPrivateFields, fetchCourses };
};
