import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useCourseAnalytics = (courseId, endpoint, totalKey) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const url = `${backendUrl}/api/instructor/courses/${courseId}/${endpoint}`;

      try {
        const response = await axios.get(url, { withCredentials: true });
        if (response.data.success) {
          setData(response.data.result);
          setTotal(0);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, endpoint, totalKey]);

  return { data, total, loading, error };
};

export const useCourseEarnings = (courseId) => {
  return useCourseAnalytics(courseId, 'earning', 'totalEarnings');
};

export const useCourseEnrollments = (courseId) => {
  return useCourseAnalytics(courseId, 'enrollments', 'totalEnrolled');
};

export default function useMyCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!id || !backendUrl) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/courses/${id}/details`,
        { withCredentials: true },
      );
      if (data && data.success) setCourse(data.result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse, id };
}

export const useCourseStudentList = (courseId, page = 1, limit = 10, search = '') => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/instructor/courses/${courseId}/students`, {
        params: { page, limit, search },
        withCredentials: true,
      });

      if (data.success) {
        setStudents(data.result);
        setTotal(data.pagination.totalItems);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [courseId, page, limit, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, total, totalPages, loading, error, refetch: fetchStudents };
};
