import axios from "axios";
import { useCallback } from "react";

export default function useGuest() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchInstructorDetails = useCallback(async (instructorId) => {
    if (!instructorId) throw new Error("Cannot find instructor");

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructors/${instructorId}`,
      );

      if (!data.success) {
        throw new Error(data.message || "Cannot fetch instructor details")
      }

      return data.instructor;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to fetch instructor details";
      throw new Error(msg);
    }
  }, [backendUrl]);

  const fetchInstructorBasicDetails = useCallback(async (instructorId) => {
    if (!instructorId) throw new Error("Cannot find instructor");

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructors/${instructorId}/basic`,
      );

      if (!data.success) {
        throw new Error(data.message || "Cannot fetch instructor details")
      }

      return data.instructor;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to fetch instructor details";
      throw new Error(msg);
    }
  }, [backendUrl]);

  return {
    fetchInstructorDetails,
    fetchInstructorBasicDetails
  };
}