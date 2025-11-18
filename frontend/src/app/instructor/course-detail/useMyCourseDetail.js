import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useCourseAnalytics = (courseId, period, endpoint, totalKey) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId || !period) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const url = `${backendUrl}/api/instructor/courses/${courseId}/${endpoint}?period=${period}`;

      try {
        const response = await axios.get(url, { withCredentials: true });
        if (response.data.success) {
          setData(response.data.data);
          setTotal(response.data[totalKey]);
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
  }, [courseId, period, endpoint, totalKey]);

  return { data, total, loading, error };
};

export const useCourseEarnings = (courseId, period) => {
  return useCourseAnalytics(courseId, period, 'earnings', 'totalEarnings');
};

export const useCourseEnrollments = (courseId, period) => {
  return useCourseAnalytics(courseId, period, 'enrollments', 'totalEnrolled');
};

export default function useMyCourseDetail() {
  const { id } = useParams(); // get ID from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!id || !backendUrl) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/${id}`);
      if (data && data.success) setCourse(data.course);
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