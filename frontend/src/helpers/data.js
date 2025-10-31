import axios from "axios";
import { blogsData, courseResumeData, eventScheduleData, playListData, pricingPlans, studentData, studentReviewData, testimonialData, userReviewData, administratorsData } from '@/assets/data/other';
import { booksData, collegesData, courseCategories, coursesData, eventsData, instructorsData } from '@/assets/data/products';
import { sleep } from '@/utils/promise';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const getAllCourses = async () => {
  await sleep();
  return coursesData;
};
export const getAllEvents = async () => {
  await sleep();
  return eventsData;
};
export const getAllInstructors = async () => {
  await sleep();
  return instructorsData;
};
export const getInstructorById = async id => {
  const data = instructorsData.find(instructor => instructor.id == id);
  await sleep();
  return data;
};
export const getAllColleges = async () => {
  await sleep();
  return collegesData;
};
export const getAllBooks = async () => {
  await sleep();
  return booksData;
};
export const getProductById = async id => {
  const data = booksData.find(product => product.id == id);
  await sleep();
  return data;
};
export const getAllEventSchedule = async () => {
  await sleep();
  return eventScheduleData;
};
export const getAllCategories = async () => {
  await sleep();
  return courseCategories;
};
export const getAllUserReviews = async () => {
  await sleep();
  return userReviewData;
};
export const getAllStudentsReviews = async () => {
  await sleep();
  return studentReviewData;
};
export const getAllPlaylist = async () => {
  await sleep();
  return playListData;
};
export const getAllBlogs = async () => {
  await sleep();
  return blogsData;
};
export const getAllPricingPlans = async () => {
  await sleep();
  return pricingPlans;
};
export const getBlogById = async id => {
  const data = blogsData.find(blog => blog.id == id);
  await sleep();
  return data;
};
export const getAllTestimonials = async () => {
  const data = testimonialData.map(testimonial => {
    const course = coursesData.find(course => course.id === testimonial.courseId);
    return {
      ...testimonial,
      course
    };
  });
  await sleep();
  return data;
};
export const getAllCourseResume = async () => {
  const data = courseResumeData.map(courseResume => {
    const course = coursesData.find(course => course.id === courseResume.courseId);
    return {
      ...courseResume,
      course
    };
  });
  await sleep();
  return data;
};
export const getAllStudents = async (page = 1, search = "") => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(`${backendUrl}/api/admin/students?page=${page}&limit=5&search=${encodeURIComponent(search)}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      return response.data;
    }
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};
export const getAllAdminitrators = async (page = 1, search = "") => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(`${backendUrl}/api/admin/admins?page=${page}&limit=7&search=${encodeURIComponent(search)}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      return response.data;
    }
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching administrators:", error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const blockStudent = async (id) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/admin/students/${id}/block`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error blocking student:", error);
    return { success: false, message: error.message };
  }
};

export const unblockStudent = async (id) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/admin/students/${id}/unblock`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error unblocking student:", error);
    return { success: false, message: error.message };
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/admin/students/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, message: error.message };
  }
};