
// Dialogflow intents
export const INTENT = {
  COURSE_SEARCH: "COURSE_SEARCH",
  PAGE_NAVIGATION: "PAGE_NAVIGATION",
  LEARNING_PROGRESS: "LEARNING_PROGRESS",
  FAQ: "FAQ",
  COURSE_RECOMMENDATION: "COURSE_RECOMMENDATION",
};

// How many recommended course cards to show in a single chatbot reply.
export const RECOMMENDATION_CARD_LIMIT = 4;

/**
 * Quick-reply chips offered to the user. Used both on the welcome screen
 * (frontend) and as follow-ups when Dialogflow can't match the message
 * (backend fallback). `query` is the text sent back when a chip is clicked.
 */
export const SUGGESTIONS = {
  en: [
    { label: "Recommend courses", query: "Recommend some courses for me" },
    { label: "Payment methods", query: "What payment methods do you accept?" },
    { label: "Get a certificate", query: "How do I get a certificate?" },
    { label: "Become an instructor", query: "How do I become an instructor?" },
  ],
  vi: [
    { label: "Gợi ý khóa học", query: "Gợi ý vài khóa học cho tôi" },
    { label: "Cách thanh toán", query: "Có những phương thức thanh toán nào?" },
    { label: "Lấy chứng chỉ", query: "Làm sao để lấy chứng chỉ?" },
    { label: "Trở thành giảng viên", query: "Làm sao để trở thành giảng viên?" },
  ],
};

export const PAGE_MAP = {
  // public ---
  "home": { path: "/" },
  "courses": { path: "/courses" },
  "instructors": { path: "/instructors" },
  "signin": { path: "/auth/sign-in" },
  "signup": { path: "/auth/sign-up" },

  // role-based ---
  "cart": {
    "student": "/student/cart",
  },
  "dashboard": {
    "student": "/student/dashboard",
    "instructor": "/instructor/dashboard",
  },
  "my_courses": {
    "student": "/student/courses",
    "instructor": "/instructor/courses",
  },
  "orders": {
    "student": "/student/orders",
  },
  "profile": {
    "student": "/student/profile",
    "instructor": "/instructor/profile",
  },
  "my_students": {
    "instructor": "/instructor/students",
  },
  "earnings": {
    "instructor": "/instructor/earnings",
  },
  "settings": {
    "student": "/student/settings",
    "instructor": "/instructor/settings",
  },
  "wishlist": {
    "student": "/student/wishlist",
  },
  "create_course": {
    "instructor": "/instructor/courses/create"
  },
  "become_instructor": {
    "student": "/student/become-instructor"
  },

  // exception ---
  // cant get details if no id, #TODO: get current page context (fe)
  "course_details": { path: "/courses" },
  "instructor_details": { path: "/instructors" },
  "my_course_details": {
    path: {
      "student": "/student/courses",
      "instructor": "/instructor/courses",
    }
  },
};
