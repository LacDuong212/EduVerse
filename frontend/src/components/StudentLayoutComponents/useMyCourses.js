// useMyCourses.js
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const getFirstLectureId = (course) => {
  const sections = Array.isArray(course?.curriculum) ? course.curriculum : [];
  for (const sec of sections) {
    const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];
    const free = lecs.find((l) => l?.isFree);
    if (free?._id) return free._id;
  }
  for (const sec of sections) {
    const lecs = Array.isArray(sec?.lectures) ? sec.lectures : [];
    if (lecs.length && lecs[0]?._id) return lecs[0]._id;
  }
  if (course?.previewVideo) return "preview";
  return null;
};

export const useMyCourses = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 8,
  });

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    // 👇 thêm 2 field này
    totalCompletedLectures: 0,
    totalLectures: 0,
  });

  const fetchMyCourses = async (_page = 1) => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${backendUrl}/api/student/my-courses`,
        { withCredentials: true }
      );

      if (data.success) {
        const courses = data.courses || [];

        // 1) normalize
        const normalized = courses.map((c) => ({
          _id: c._id,
          name: c.title || "Untitled Course",
          image:
            c.image ||
            c.thumbnail ||
            "https://placehold.co/640x360?text=No+Video+Preview",
          totalLectures: c.lecturesCount ?? c.totalLectures ?? 0,
          completedLectures: 0, // sẽ override sau
          firstLectureId: getFirstLectureId(c),
          hasPreview: !!c.previewVideo,
        }));

        // 2) lấy progress từng course
        let withProgress = normalized;

        if (courses.length > 0) {
          try {
            const progressResults = await Promise.all(
              courses.map(async (c) => {
                try {
                  const url = `${backendUrl}/api/courses/${encodeURIComponent(
                    c._id
                  )}/progress`;

                  const { data: pData } = await axios.get(url, {
                    withCredentials: true,
                  });

                  const completedLecturesCount =
                    pData?.progress?.completedLecturesCount ?? 0;

                  return {
                    courseId: c._id,
                    completedLectures: completedLecturesCount,
                  };
                } catch (err) {
                  console.warn(
                    "[useMyCourses] cannot load progress for course",
                    c._id,
                    err
                  );
                  return {
                    courseId: c._id,
                    completedLectures: 0,
                  };
                }
              })
            );

            const progressMap = {};
            for (const item of progressResults) {
              progressMap[item.courseId] = item.completedLectures;
            }

            withProgress = normalized.map((item) => ({
              ...item,
              completedLectures: progressMap[item._id] ?? 0,
            }));
          } catch (err) {
            console.warn("[useMyCourses] progress batch error", err);
          }
        }

        // ✅ set courseData với completedLectures
        setCourseData(withProgress);

        // 3) TÍNH stats: số course đã hoàn thành / đang học + tổng lectures
        const totalCourses = withProgress.length;
        let completedCourses = 0;
        let inProgressCourses = 0;
        let totalCompletedLectures = 0;
        let totalLectures = 0;

        withProgress.forEach((c) => {
          const total = Number(c.totalLectures || 0);
          const done = Number(c.completedLectures || 0);

          totalLectures += total;
          totalCompletedLectures += done;

          if (total > 0 && done >= total) {
            completedCourses += 1;
          } else if (done > 0 && done < total) {
            inProgressCourses += 1;
          }
        });

        setStats({
          total: totalCourses,
          completed: completedCourses,
          inProgress: inProgressCourses,
          totalCompletedLectures,
          totalLectures,
        });

        setPagination({
          page: 1,
          total: totalCourses,
          limit: withProgress.length || 8,
          totalPages: 1,
        });
      } else {
        toast.error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { courseData, pagination, loading, fetchMyCourses, stats };
};
