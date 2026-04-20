import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useCreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const createCourse = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/instructor/courses`,
        {},
        { withCredentials: true }
      );
      const data = response.data;
      
      if (data.success && data.result) {
        const courseId = data.result;

        toast.success("New draft course created!");

        navigate(`/instructor/courses/${courseId}/edit`, { replace: true });
      } else {
        toast.error(data.message || "Failed to create course");
      }

    } catch (error) {
      console.error("Create course error:", error);
      toast.error("Error creating course");
    } finally {
      setIsLoading(false); 
    }
  };

  return { createCourse, isLoading };
};

export default useCreateCourse;