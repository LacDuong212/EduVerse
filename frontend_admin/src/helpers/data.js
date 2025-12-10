import axios from "axios";

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

export const updateCourseStatus = async ({ id, status }) => {
  try {
    const res = await axios.patch(
      `${backendUrl}/api/courses/${id}?newStatus=${status}`,
      {},
      axiosConfig
    );

    if (res.data.success) {
      return res.data;
    }
  } catch (error) {
    console.error("Update status failed: ", error);
    return { success: false, message: error.message };
  }
};

//STUDENT
export const getAllStudents = async (page = 1, search = "") => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/students?page=${page}&limit=5&search=${encodeURIComponent(search)}`,
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
export const getAllInstructors = async (page = 1, search = "") => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors?page=${page}&limit=5&search=${encodeURIComponent(search)}`,
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

export const getInstructorRequests = async (page = 1, search = "") => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/instructors/requests?page=${page}&limit=5&search=${encodeURIComponent(search)}`,
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

export const blockInstructor = async (id) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/instructors/${id}/block`,
      {},
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

export const rejectInstructorRequest = async (id) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/instructors/${id}/reject`,
      axiosConfig
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