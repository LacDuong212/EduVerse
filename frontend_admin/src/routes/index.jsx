import { lazy } from 'react';

// AUTH-ADMIN
const AdminSignUp = lazy(() => import('@/app/auth/sign-up/page'));
const AdminSignIn = lazy(() => import('@/app/auth/sign-in/page'));
const AdminForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'));
const AdminResetPassword = lazy(() => import('@/app/auth/reset-password/page'));

// ADMIN
const AdminNotFoundPage = lazy(() => import("@/app/not-found"));
const AdminDashboard = lazy(() => import('@/app/dashboard/page'));
const AdminAllCourses = lazy(() => import('@/app/all-courses/page'));
const AdminCategory = lazy(() => import('@/app/category/page'));
const AdminCoupons = lazy(() => import('@/app/coupons/page'));
const ComingSoonPage = lazy(() => import('@/app/coming-soon/page'));
const AdminStudents = lazy(() => import('@/app/students/page'));
const AdminInstructors = lazy(() => import('@/app/instructors/page'));
// const AdminAdminstrators = lazy(() => import('@/app/administrators/page'));
const AdminInstructorRequests = lazy(() => import('@/app/instructor-requests/page'));
const AdminReviews = lazy(() => import('@/app/reviews/page'));
const AdminEarnings = lazy(() => import('@/app/earnings/page'));
const AdminSettings = lazy(() => import('@/app/admin-settings/page'));

export const authAdminRoutes = [{
  path: '/auth/sign-in',
  name: 'Admin Sign In',
  element: <AdminSignIn />
}, {
  path: '/auth/sign-up',
  name: 'Admin Sign Up',
  element: <AdminSignUp />
}, {
  path: '/auth/forgot-password',
  name: 'Admin Forgot Password',
  element: <AdminForgotPassword />
}, {
  path: '/auth/reset-password',
  name: 'Admin Reset Password',
  element: <AdminResetPassword />
}];

export const adminRoutes = [{
  path: '/dashboard',
  name: 'Admin',
  element: <AdminDashboard />
}, {
  path: '/all-courses',
  name: 'All Courses',
  element: <AdminAllCourses />
}, {
  path: '/category',
  name: 'Category',
  element: <AdminCategory />
}, {
  path: '/coupons',
  name: 'Coupons',
  element: <AdminCoupons />
}, {
  path: '/course-detail',
  name: 'Course Detail',
  element: <ComingSoonPage />
}, {
  path: '/students',
  name: 'Students',
  element: <AdminStudents />
}, {
  path: '/instructors',
  name: 'Instructors',
  element: <AdminInstructors />
},
// {
//   path: '/administrators',
//   name: 'Adminstrators',
//   element: <AdminAdminstrators />
// },
 {
  path: '/instructor-detail',
  name: 'Instructor Detail',
  element: <ComingSoonPage />
}, {
  path: '/instructor-requests',
  name: 'Instructor Requests',
  element: <AdminInstructorRequests />
}, {
  path: '/reviews',
  name: 'Reviews',
  element: <ComingSoonPage />
}, {
  path: '/earnings',
  name: 'Earnings',
  element: <AdminEarnings />
}, {
  path: '/admin-settings',
  name: 'Admin Settings',
  element: <AdminSettings />
}, {
  path: '/*',
  name: 'Resource Not Found',
  element: <AdminNotFoundPage />
}];