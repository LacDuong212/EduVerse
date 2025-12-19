import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// ✅ Danh sách category cố định (để radar luôn đủ trục)
const ALL_CATEGORIES = [
  "Web Development",
  "Security",
  "Information Technology",
  "DevOps",
  "Data",
  "Network",
  "Game Development",
  "Mobile Development",
  "Cloud Development",
  "Artificial Intelligence",
];

export const useSkillRadar = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [radar, setRadar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRadar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        `${backendUrl}/api/student/skill-radar`,
        { withCredentials: true }
      );

      // --- đọc dữ liệu từ BE ---
      const apiLabels = Array.isArray(data?.labels) ? data.labels : [];
      const apiValues = Array.isArray(data?.values) ? data.values : [];
      const apiSystem = Array.isArray(data?.systemAvgValues)
        ? data.systemAvgValues
        : [];

      // --- map label -> value ---
      const userMap = {};
      const systemMap = {};

      apiLabels.forEach((lab, idx) => {
        userMap[lab] = Number(apiValues[idx] ?? 0);
        systemMap[lab] = Number(apiSystem[idx] ?? 0);
      });

      // --- fill đủ category cho radar ---
      const labels = ALL_CATEGORIES;
      const values = labels.map((lab) => userMap[lab] ?? 0);
      const systemAvgValues = labels.map((lab) => systemMap[lab] ?? 0);

      setRadar({ labels, values, systemAvgValues });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load skill radar"
      );
      setRadar(null);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchRadar();
  }, [fetchRadar]);

  return { radar, loading, error, refetch: fetchRadar };
};
