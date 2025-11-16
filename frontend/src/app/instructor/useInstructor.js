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

  const fetchCourses = useCallback(async (page, limit, search = '', sort = '') => {
    if (!userId) return null;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/courses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${sort}`,
        { withCredentials: true }
      );
      if (data?.success) return data;
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [userId]);

  const setCoursePrivacy = async (courseId, makePrivate) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/courses/${courseId}?setPrivacy=${makePrivate}`,
        {},
        { withCredentials: true }
      );

      if (data?.success) {
        toast.success(data.message || 'Course updated!');
        return true;
      } else {
        toast.error(data.message || 'Failed to update course');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating course privacy');
      return false;
    }
  };

  return { fetchPublicFields, fetchPrivateFields, fetchCourses, setCoursePrivacy };
};
