import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosConfig = {
  withCredentials: true,
};

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
