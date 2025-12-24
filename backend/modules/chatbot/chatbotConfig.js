
// Dialogflow intents
export const INTENT = {
  COURSE_SEARCH: "COURSE_SEARCH",
  PAGE_NAVIGATION: "PAGE_NAVIGATION",
  LEARNING_PROGRESS: "LEARNING_PROGRESS",
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
  // cant get details if no id  #TODO: get current page context (fe)
  "course_details": { path: "/courses" },
  "instructor_details": { path: "/instructors" },
  "my_course_details": {
    path: {
      "student": "/student/courses",
      "instructor": "/instructor/courses",
    }
  },
};
