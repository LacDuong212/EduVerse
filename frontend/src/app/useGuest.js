import axios from "axios";

export default function useGuest() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchInstructorDetails = async (instructorId) => {
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
      throw new Error(error || "Failed to fetch instructor details")
    }
  };

  return {
    fetchInstructorDetails,
  };
}