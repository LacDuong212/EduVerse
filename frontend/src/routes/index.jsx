import { lazy } from 'react';
import HomePage from "../app/home/page";
import CourseDetails from "../app/pages/course/detail/page";
import CoursesPage from "../app/pages/course/grid/page";

//AUTH
const SignIn = lazy(() => import('@/app/auth/sign-in/page'));
const SignUp = lazy(() => import('@/app/auth/sign-up/page'));
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'));
const ResetPassword = lazy(() => import('@/app/auth/reset-password/page'));

// INSTRUCTOR
import Account from "../app/instructor/account";
import InstructorDashboard from "../app/instructor/dashboard";
import InstructorMyCourses from "../app/instructor/my-courses";
import InstructorMyStudents from "../app/instructor/my-students";
import CreateCoursePage from "../app/instructor/create-course";

//AUTH-ADMIN
const AdminSignUp = lazy(() => import('@/app/admin/auth/sign-up/page'));
const AdminSignIn = lazy(() => import('@/app/admin/auth/sign-in/page'));
const AdminForgotPassword = lazy(() => import('@/app/admin/auth/forgot-password/page'));
const AdminResetPassword = lazy(() => import('@/app/admin/auth/reset-password/page'));

//ADMIN
const AdminDashboard = lazy(() => import('@/app/admin/dashboard/page'));
const AllCourses = lazy(() => import('@/app/admin/all-courses/page'));
const CourseCategory = lazy(() => import('@/app/admin/course-category/page'));
const ComingSoonPage = lazy(() => import('@/app/admin/coming-soon/page'));
const AdminStudents = lazy(() => import('@/app/admin/students/page'));
const AdminInstructors = lazy(() => import('@/app/admin/instructors/page'));
const AdminAdminstrators = lazy(() => import('@/app/admin/administrators/page'));
const AdminInstructorRequests = lazy(() => import('@/app/admin/instructor-requests/page'));
const AdminReviews = lazy(() => import('@/app/admin/reviews/page'));
const AdminEarnings = lazy(() => import('@/app/admin/earnings/page'));
const AdminSettings = lazy(() => import('@/app/admin/admin-settings/page'));

//STUDENT
import VideoPlayer from "../app/pages/course/video-player/page";
import CartDetails from "../app/shop/cart/page";

export const guestRoutes = [{
  path: '/home',
  name: 'Home',
  element: <HomePage />
},{
path: '/courses',
  name: 'Courses',
  isNested: false,
  element: <CoursesPage />
}, {
  path: '/courses/:id',
  name: 'CourseDetails',
  element: <CourseDetails />
}];

export const authRoutes = [{
  path: '/auth/sign-in',
  name: 'Sign In',
  element: <SignIn />
}, {
  path: '/auth/sign-up',
  name: 'Sign Up',
  element: <SignUp />
}, {
  path: '/auth/forgot-password',
  name: 'Forgot Password',
  element: <ForgotPassword />
}, {
  path: '/auth/reset-password',
  name: 'Reset Password',
  element: <ResetPassword />
}];

export const instructorRoutes = [{
  path: '/instructor/dashboard',
  name: 'Dashboard',
  isNested: false,
  element: <InstructorDashboard />
}, {
  path: '/instructor/courses',
  name: 'My Courses',
  isNested: false,
  element: <InstructorMyCourses />
}, {
  path: '/instructor/students',
  name: 'Students',
  isNested: false,
  element: <InstructorMyStudents />
}, {
  path: '/instructor/account',
  name: 'Account',
  isNested: true,
  element: <Account />
}, {
  path: '/instructor/settings',
  name: 'Settings',
  isNested: true,
  element: null
}, {
  path: '/instructor/balance',
  name: 'My Balance',
  isNested: true,
  element: null
}, {
  path: '/instructor/reviews',
  name: 'Reviews',
  isNested: true,
  element: null
}, {
  path: '/instructor/deactivate-account',
  name: 'Deactivate Account',
  isNested: true,
  element: null
}, {
  path: '/instructor/create-course',
  name: 'Create Course',
  isNested: false,
  element: <CreateCoursePage />
}, {
  path: '/instructor/update-course',
  name: 'Update Course',
  isNested: true,
  element: null
}];

export const authAdminRoutes = [{
  path: '/admin/auth/sign-in',
  name: 'Admin Sign In',
  element: <AdminSignIn />
}, {
  path: '/admin/auth/sign-up',
  name: 'Admin Sign Up',
  element: <AdminSignUp />
}, {
  path: '/admin/auth/forgot-password',
  name: 'Admin Forgot Password',
  element: <AdminForgotPassword />
}, {
  path: '/admin/auth/reset-password',
  name: 'Admin Reset Password',
  element: <AdminResetPassword />
}];

export const adminRoutes = [{
  path: '/admin/dashboard',
  name: 'Admin',
  element: <AdminDashboard />
}, {
  path: '/admin/all-courses',
  name: 'All Courses',
  element: <AllCourses />
}, {
  path: '/admin/course-category',
  name: 'Course Category',
  element: <CourseCategory />
}, {
  path: '/admin/course-detail',
  name: 'Course Detail',
  element: <ComingSoonPage />
}, {
  path: '/admin/students',
  name: 'Students',
  element: <AdminStudents />
}, {
  path: '/admin/instructors',
  name: 'Instructors',
  element: <AdminInstructors />
},{
  path: '/admin/administrators',
  name: 'Adminstrators',
  element: <AdminAdminstrators />
}, {
  path: '/admin/instructor-detail',
  name: 'Instructor Detail',
  element: <ComingSoonPage />
}, {
  path: '/admin/instructor-requests',
  name: 'Instructor Requests',
  element: <AdminInstructorRequests />
}, {
  path: '/admin/reviews',
  name: 'Reviews',
  element: <ComingSoonPage />
}, {
  path: '/admin/earnings',
  name: 'Earnings',
  element: <AdminEarnings />
}, {
  path: '/admin/admin-settings',
  name: 'Admin Settings',
  element: <AdminSettings />
}
];

export const studentRoutes = [{
  path: '/student/my-courses',
  name: 'My Courses',
  isNested: true,
  element: null
}, {
  path: '/student/video-player',
  name: 'My Video Player',
  isNested: false,
  element: <VideoPlayer />
},{
  path: '/student/cart',
  name: 'My Cart',
  isNested: false,
  element: <CartDetails />
}, {
  path: '/student/orders',
  name: 'Orders',
  isNested: true,
  element: null
}];
