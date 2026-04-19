
export const hasMeaningfulDraftData = (draft) => {
  if (!draft) return false;

  const keys = Object.keys(draft);
  if (keys.length === 0) return false;

  return true;
};

// #TODO: show all error at once
export const validateFullCourse = (courseData) => {
  if (!courseData) return "No course data found.";

  // step 1 ---
  if (!courseData.title?.trim()) return "Title is required.";
  if (!courseData.categoryId?.trim()) return "Category is required.";
  if (!courseData.level?.trim()) return "Level is required.";
  if (!courseData.language?.trim()) return "Language is required.";
  if (courseData.price == null || courseData.price < 0) return "A valid price is required.";

  if (courseData.enableDiscount) {
    if (courseData.discountPrice == null || courseData.discountPrice < 0) return "Discount price is required.";
    if (Number(courseData.discountPrice) >= Number(courseData.price)) return "Discount must be less than price.";
  }

  // step 2 ---
  if (!courseData.image?.trim()) return "Course image is required.";

  const v = courseData.previewVideo;
  if (v && v.trim() !== "") {
    const isValidFormat = v.startsWith("LEC") || /^1766.*\.mp4$/.test(v);
    if (!isValidFormat) {
      return "The provided preview video format is invalid.";
    }
  }

  // step 3 ---
  const curriculum = courseData.curriculum || [];
  if (curriculum.length === 0) {
    return "Curriculum must have at least one section.";
  }
  if (curriculum.some(sec => !sec.lectures || sec.lectures.length === 0)) {
    return "Each section must contain at least one lecture.";
  }

  // step 4 ---
  const tags = courseData.tags || [];
  if (tags.length > 14) {
    return "Maximum 14 tags allowed.";
  }
  if (tags.some(t => t.length > 25)) {
    return "Each tag must be under 25 characters.";
  }

  return null; // all good!
};

export const handleAxiosError = (error, defaultMsg) => {
  console.error(defaultMsg, error);
  if (error.response) {
    const { status, data } = error.response;
    const msg = data?.message;
    switch (status) {
      case 413: return "Course too large! Please reduce size.";
      case 400: return msg || "Invalid data. Please recheck fields.";
      case 401: return msg || "Session expired. Login again.";
      case 403: return msg || "Permission denied.";
      case 404: return msg || "Course not found.";
      case 500: return msg || "Server error.";
      default: return msg || `Error: ${status}`;
    }
  }
  return error.request ? "Network error." : error.message || defaultMsg;
};