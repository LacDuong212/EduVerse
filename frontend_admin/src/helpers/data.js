import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosConfig = {
  withCredentials: true,
};

export const getAllAdminitrators = async (page = 1, search = "") => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/admins?page=${page}&limit=7&search=${encodeURIComponent(search)}`,
      axiosConfig
    );
    if (response.data.success) {
      return response.data;
    }
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching administrators:", error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

// COURSE
export const approveCourse = async (id, message = null) => {
  try {
    const res = await axios.patch(
      `${backendUrl}/api/courses/${id}/approve`,
      { ...axiosConfig, data: { message } }
    );

    if (res.data?.success) {
      toast.success(res.data.message || "Course approved successfully!");
      return {
        success: true,
        message: res.data.message,
        result: res.data.result,
      };
    }
  } catch (error) {
    console.error("Approve course failed: ", error);
    const errorMessage = error.response?.data?.message || "Something went wrong.";
    toast.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
      result: null,
    };
  }
};

export const deleteCourse = async (id, message = null) => {
  try {
    const res = await axios.delete(
      `${backendUrl}/api/courses/${id}`,
      { ...axiosConfig, data: { message } }
    );

    if (res.data?.success) {
      toast.success(res.data.message || "Course deleted successfully!");
      return {
        success: true,
        message: res.data.message,
        result: res.data.result,
      };
    }
  } catch (error) {
    console.error("Delete course failed: ", error);
    const errorMessage = error.response?.data?.message || "Something went wrong.";
    toast.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
      result: null,
    };
  }
};

export const restoreCourse = async (id, message = null) => {
  try {
    const res = await axios.patch(
      `${backendUrl}/api/courses/${id}/restore`,
      { message },
      axiosConfig
    );

    if (res.data?.success) {
      toast.success(res.data.message || "Course restored successfully!");
      return {
        success: true,
        message: res.data.message,
        result: res.data.result,
      };
    }
  } catch (error) {
    console.error("Restore course failed: ", error);
    const errorMessage = error.response?.data?.message || "Something went wrong.";
    toast.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
      result: null,
    };
  }
};

export const unblockCourse = async (id, message = null) => {
  try {
    const res = await axios.patch(
      `${backendUrl}/api/courses/${id}/unblock`,
      { message },
      axiosConfig
    );

    if (res.data?.success) {
      toast.success(res.data.message || "Course unblocked successfully!");
      return {
        success: true,
        message: res.data.message,
        result: res.data.result,
      };
    }
  } catch (error) {
    console.error("Unblock course failed: ", error);
    const errorMessage = error.response?.data?.message || "Something went wrong.";
    toast.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
      result: null,
    };
  }
};

export const updateCourseStatus = async (id, status, message = null) => {
  try {
    const res = await axios.post(
      `${backendUrl}/api/courses/${id}/status`,
      { newValue: status, message },
      axiosConfig
    );

    if (res.data.success) {
      toast.success("Notified instructor!")
      return {
        success: true,
        message: res.data.message,
        result: res.data.result,
      };
    }
  } catch (error) {
    console.error("Update status failed: ", error);
    const errorMessage = error.response?.data?.message || "Something went wrong.";
    return {
      success: false,
      message: errorMessage,
      result: null,
    };
  }
};

// STUDENT
export const getAllStudents = async (page = 1, search = "", limit = 9999) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/students?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      axiosConfig
    );
    if (response.data.success) {
      return response.data;
    }
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

export const blockStudent = async (id) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/students/${id}/block`,
      {},
      axiosConfig
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
      `${backendUrl}/api/students/${id}/unblock`,
      {},
      axiosConfig
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
      `${backendUrl}/api/students/${id}`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, message: error.message };
  }
};

// INSTRUCTOR
export const getAllInstructors = async (page = 1, search = "", limit = 9999) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      axiosConfig
    );
    if (response.data.success) {
      return response.data;
    }
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching instructor:", error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

export const getInstructorRequests = async (page = 1, search = "", limit = 9999) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors/requests?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      axiosConfig
    );
    if (response.data.success) {
      return response.data;
    }
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching instructor requests:", error);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
};

export const getInstructorDetail = async (id) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors/${id}/profile`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor detail:", error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const getAdminInstructorCourses = async (id, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors/${id}/courses`,
      { ...axiosConfig, params: { page, limit } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const getInstructorDetailStats = async (id) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors/${id}/stats`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor stats:", error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const blockInstructor = async (id, message) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/instructors/${id}/block`,
      { message },
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error blocking instructor:", error);
    return { success: false, message: error.message };
  }
};

export const unblockInstructor = async (id) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/instructors/${id}/unblock`,
      {},
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error unblocking instructor:", error);
    return { success: false, message: error.message };
  }
};

export const approveInstructorRequest = async (id) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/instructors/${id}/approve`,
      {},
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error approving instructor:", error);
    return { success: false, message: error.message };
  }
};

export const rejectInstructorRequest = async (id, message) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/instructors/${id}/reject`,
      { ...axiosConfig, data: { message } }
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting instructor:", error);
    return { success: false, message: error.message };
  }
};

// CATEGORY
export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/category`, { params: { mode: 'all' } });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

export const createCategory = async (data) => {
  try {
    const response = await axios.post(`${backendUrl}/api/category`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, message: error.response?.data?.message || "Error" };
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await axios.put(`${backendUrl}/api/category/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, message: error.response?.data?.message || "Error" };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${backendUrl}/api/category/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: error.response?.data?.message || "Error" };
  }
};

// COUPON
export const getAllCoupons = async () => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/coupons`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/coupons`,
      couponData,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, message: error.response?.data?.message || "Error creating coupon" };
  }
};

export const updateCouponStatus = async (id, isActive) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/coupons/${id}/status`,
      { isActive },
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return { success: false, message: error.response?.data?.message || "Error updating status" };
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/coupons/${id}`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, message: error.response?.data?.message || "Error deleting coupon" };
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/coupons/${id}`,
      couponData,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, message: error.response?.data?.message || "Error updating coupon" };
  }
};
