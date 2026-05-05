import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

const FALLBACK_IMAGE = "https://placehold.co/640x360?text=No+Course+Image";
const DEFAULT_LIMIT = 8;

const getContinueLectureId = (progress) => {
  if (!progress) return null;

  return (
    progress.currentLectureId ||
    progress.nextLectureId ||
    progress.lastLearningLectureId ||
    progress.lastLectureId ||
    progress.activeLectureId ||
    progress?.currentLecture?._id ||
    progress?.nextLecture?._id ||
    null
  );
};

export const useMyCourses = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
    sort: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: DEFAULT_LIMIT,
  });

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  });

  const normalizeCourse = useCallback((course) => {
    const id = course?.courseId || "";

    return {
      courseId: id,
      name: course?.title || "Untitled Course",
      image: course?.thumbnail || course?.image || FALLBACK_IMAGE,
      totalLectures: Number(course?.totalLectures ?? 0),
      completedLectures: Number(course?.completedLectures ?? 0),
      progress: null,
      continueLectureId: null,
    };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const { data } = await axios.get(
        `${backendUrl}/api/student/courses/stats`,
        { withCredentials: true }
      );

      if (data?.success) {
        const result = data?.result || {};

        setStats({
          total: Number(result?.totalCourses ?? 0),
          completed: Number(result?.totalCompleted ?? 0),
          inProgress: Number(result?.totalInProgress ?? 0),
          notStarted: Number(result?.totalNotStarted ?? 0),
        });
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
      toast.error(
        error?.response?.data?.message || "Error loading course statistics"
      );
    } finally {
      setStatsLoading(false);
    }
  }, [backendUrl]);

  const fetchProgressForCourses = useCallback(
    async (courses) => {
      const validCourses = courses.filter((course) => course.courseId);

      if (validCourses.length === 0) return courses;

      try {
        setProgressLoading(true);

        const progressResults = await Promise.all(
          validCourses.map(async (course) => {
            try {
              const { data } = await axios.get(
                `${backendUrl}/api/student/courses/${encodeURIComponent(
                  course.courseId
                )}/progress`,
                { withCredentials: true }
              );

              const progress = data?.result || null;

              return {
                courseId: course.courseId,
                progress,
                continueLectureId: getContinueLectureId(progress),
              };
            } catch {
              return {
                courseId: course.courseId,
                progress: null,
                continueLectureId: null,
              };
            }
          })
        );

        const progressMap = progressResults.reduce((acc, item) => {
          acc[item.courseId] = item;
          return acc;
        }, {});

        return courses.map((course) => ({
          ...course,
          progress: progressMap[course.courseId]?.progress || null,
          continueLectureId:
            progressMap[course.courseId]?.continueLectureId || null,
        }));
      } finally {
        setProgressLoading(false);
      }
    },
    [backendUrl]
  );

  const fetchCourses = useCallback(
    async (activeFilters) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(activeFilters.page || 1));
        params.set("limit", String(DEFAULT_LIMIT));

        if (activeFilters.search?.trim()) {
          params.set("search", activeFilters.search.trim());
        }

        if (activeFilters.sort) {
          params.set("sort", activeFilters.sort);
        }

        const { data } = await axios.get(
          `${backendUrl}/api/student/courses?${params.toString()}`,
          { withCredentials: true }
        );

        if (data?.success) {
          const result = Array.isArray(data?.result) ? data.result : [];
          const pageInfo = data?.pagination || {};

          const normalizedCourses = result.map(normalizeCourse);
          const coursesWithProgress = await fetchProgressForCourses(
            normalizedCourses
          );

          setCourseData(coursesWithProgress);
          setPagination({
            page: Number(pageInfo?.page ?? activeFilters.page ?? 1),
            totalPages: Number(pageInfo?.totalPages ?? 1),
            totalItems: Number(pageInfo?.totalItems ?? 0),
            limit: DEFAULT_LIMIT,
          });
        } else {
          setCourseData([]);
          setPagination({
            page: 1,
            totalPages: 1,
            totalItems: 0,
            limit: DEFAULT_LIMIT,
          });
        }
      } catch (error) {
        console.error("Fetch courses error:", error);
        toast.error(error?.response?.data?.message || "Error loading courses");
        setCourseData([]);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl, normalizeCourse, fetchProgressForCourses]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCourses(filters);
  }, [fetchCourses, filters.page, filters.search, filters.sort]);

  const fetchMyCourses = useCallback((page = 1) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setFilters((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const handleSort = useCallback((sortValue) => {
    setFilters((prev) => ({
      ...prev,
      sort: sortValue,
      page: 1,
      limit: DEFAULT_LIMIT,
    }));
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchStats(), fetchCourses(filters)]);
  }, [fetchStats, fetchCourses, filters]);

  return {
    courseData,
    pagination,
    loading: loading || statsLoading,
    progressLoading,
    stats,
    filters,
    fetchMyCourses,
    handleSearch,
    handleSort,
    refetch,
  };
};

export default useMyCourses;