import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";
import { toast } from "react-toastify";

export default function useCreateCourse({ autoRun = false } = {}) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const create = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);

    const res = await handleRequest(authApi.post("/instructor/courses"));
    
    if (res.success) {
      const courseId = res.result.courseId;
      // toast.success(res.message || "New course created!");
      navigate(`/instructor/courses/${courseId}/edit`, { replace: true });
    } else {
      navigate("/instructor/courses");
    }
    setIsCreating(false);
  }, [navigate]);

  useEffect(() => {
    if (autoRun) {
      create();
    }
  }, [autoRun, create]);

  return { isCreating };
}