import { toast } from "react-toastify";

/**
 * @param {Promise} promise - The Axios request promise
 * @param {boolean} showToast - Whether to show error toast automatically
 */
export const handleRequest = async (promise, showToast = true) => {
  try {
    const response = await promise;
    const { data, status } = response;

    if (data.success) {
      return {
        success: true,
        statusCode: status,
        result: data.result,
        pagination: data.pagination || null,
        message: data.message || "Success!",
        errors: null
      };
    }

    if (showToast) toast.error(data.message || "Action failed..");
    return {
      success: false,
      statusCode: status,
      result: data.result || null,
      message: data.message,
      errors: data.errors || null
    };

  } catch (err) {
    const response = err.response?.data;
    const statusCode = err.response?.status || 500;
    const message = response?.message || "Server-side error..";

    if (showToast) toast.error(message);

    return {
      success: false,
      statusCode: statusCode,
      result: null,
      message: message,
      errors: response?.errors || null,
    };
  }
};