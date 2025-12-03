import axios from 'axios';
import { toast } from 'react-toastify';


export default function useInstructorDashboard() {
  const fetchDashboardData = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/dashboard`,
        { withCredentials: true }
      );

      if (data?.success) return {
        earningsData: data?.earningsData || [],
        topCoursesData: data?.topCoursesData || [],
      };

      toast.error('Failed to fetch dashboard data');

      return {
        earningsData: [],
        topCoursesData: [],
      };
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch dashboard data');
      
      return {
        earningsData: [],
        topCoursesData: [],
      };
    }
  };

  return {
    fetchDashboardData,
  };
};