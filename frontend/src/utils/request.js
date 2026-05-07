import { toast } from "react-toastify";

/**
 * @param {Promise} promise - The Axios request promise
 * @param {boolean} showToast - Whether to show error toast automatically
 */
export const handleRequest = async (promise, showToast = false) => {
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
    console.error(`DEBUG [handleRequest]: ${err.message}`, err.stack);

    let userMessage = "An unexpected error occurred..";
    let statusCode = 500;
    let errors = null;

    if (err.response) {
      const data = err.response.data;
      statusCode = err.response.status;
      userMessage = data?.message || "Something went wrong on our end..";
      errors = data?.errors || null;
    } else if (err.request) {
      userMessage = "We couldn't reach the server. Please check your connection!";
      statusCode = 503;
    } else {
      userMessage = "There was a problem processing your request on this page..";
      statusCode = 400;
    }

    if (showToast) toast.error(userMessage);

    return {
      success: false,
      statusCode: statusCode,
      result: null,
      message: userMessage,
      errors: errors,
      technicalError: err.message
    };
  }
};