import axios from 'axios';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function useInstructor() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
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

  const fetchInstructorCounters = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/counters`,
        { withCredentials: true }
      );

      if (data?.success) return {
        averageRating: data?.averageRating || 0.0,
        totalCourses: data?.totalCourses || 0,
        totalOrders: data?.totalOrders || 0,
        totalStudents: data?.totalStudents || 0,
      };

      toast.error('Failed to fetch instructor stats');

      return {
        averageRating: 0.0,
        totalCourses: 0,
        totalOrders: 0,
        totalStudents: 0,
      };
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch instructor stats');

      return {
        averageRating: 0.0,
        totalCourses: 0,
        totalOrders: 0,
        totalStudents: 0,
      };
    }
  };

  const fetchInstructorProfile = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/profile`,
        { withCredentials: true }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch profile")
      }

      return { instructor: data.instructor ?? {} };
    } catch (error) {
      throw new Error(error || "Failed to fetch profile")
    }
  };

  const updateInstructorProfile = async (payload) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/instructor/profile`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
      }

    } catch (error) {
      // check if the server sent a response (4xx/5xx errors)
      if (error.response && error.response.data) {

        // if specific validation array
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => toast.error(err));
          throw new Error("Cannot update profile");
        }

        // if a single message
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }

      // network errors (server down, no internet)
      throw new Error("Network error, please try again later");
    }
  };

  const fetchStudents = useCallback(async (page, limit, search = '', sort = '') => {
    if (!userId) return null;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/students?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${sort}`,
        { withCredentials: true }
      );

      if (data?.success) return data;

      throw new Error(data?.message || "Cannot fetch students");
    } catch (error) {
      console.error(error);
      throw new Error(error.response.data?.message || "Failed to fetch students");
    }
  }, [userId]);

  const fetchInstructorEarnings = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/earnings`,
        { withCredentials: true }
      );

      if (data?.success) 
        return {
          earningsData: data.earningsData || [],
          thisMonthEarnings: data.thisMonthEarnings || 0,
          toBePaid: data.toBePaid || 0,
          lifeTimeEarnings: data.lifeTimeEarnings || 0
        } 
      else
        throw new Error(data?.message || "Cannot get earnings");
    } catch (error) {
      console.error("Failed to get earnings", error);
      throw new Error(error.response?.data?.message || "Failed to get earnings")
    }
  };

  return {
    fetchPublicFields,
    fetchPrivateFields,
    fetchCourses,
    setCoursePrivacy,
    fetchInstructorCounters,
    fetchInstructorProfile,
    updateInstructorProfile,
    fetchStudents,
    fetchInstructorEarnings,
  };
};
