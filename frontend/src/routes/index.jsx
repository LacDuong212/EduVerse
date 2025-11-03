import { lazy } from 'react';

// AUTH
const SignIn = lazy(() => import('@/app/auth/sign-in/page'));
const SignUp = lazy(() => import('@/app/auth/sign-up/page'));
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'));
const ResetPassword = lazy(() => import('@/app/auth/reset-password/page'));

// INSTRUCTOR
import InstructorAccount from "../app/instructor/account";
import InstructorCreateCoursePage from "../app/instructor/create-course";
import InstructorDashboard from "../app/instructor/dashboard";
import InstructorMyCourses from "../app/instructor/my-courses";
import InstructorMyStudents from "../app/instructor/my-students";

// AUTH-ADMIN
const AdminSignUp = lazy(() => import('@/app/admin/auth/sign-up/page'));
const AdminSignIn = lazy(() => import('@/app/admin/auth/sign-in/page'));
const AdminForgotPassword = lazy(() => import('@/app/admin/auth/forgot-password/page'));
const AdminResetPassword = lazy(() => import('@/app/admin/auth/reset-password/page'));

// ADMIN
const AdminNotFoundPage = lazy(() => import("@/app/admin/not-found"));
const AdminDashboard = lazy(() => import('@/app/admin/dashboard/page'));
const AdminAllCourses = lazy(() => import('@/app/admin/all-courses/page'));
const CourseCategory = lazy(() => import('@/app/admin/course-category/page'));
const ComingSoonPage = lazy(() => import('@/app/admin/coming-soon/page'));
const AdminStudents = lazy(() => import('@/app/admin/students/page'));
const AdminInstructors = lazy(() => import('@/app/admin/instructors/page'));
const AdminAdminstrators = lazy(() => import('@/app/admin/administrators/page'));
const AdminInstructorRequests = lazy(() => import('@/app/admin/instructor-requests/page'));
const AdminReviews = lazy(() => import('@/app/admin/reviews/page'));
const AdminEarnings = lazy(() => import('@/app/admin/earnings/page'));
const AdminSettings = lazy(() => import('@/app/admin/admin-settings/page'));

// STUDENT
const Checkout = lazy(() => import('@/app/shop/checkout/page'));
const PaymentSuccess = lazy(() => import('@/app/shop/payment-result/success/page'));
const PaymentFailed = lazy(() => import('@/app/shop/payment-result/failed/page'));
import CartDetails from "../app/shop/cart/page";
import StudentMyCourses from '../app/student/my-courses';
import StudentAccount from '../app/student/account';

// PUBLIC
import HomePage from "../app/home/page";
import CoursesPage from "../app/pages/course/grid/page";
import CourseDetails from "../app/pages/course/detail/page";
import VideoPlayer from "../app/pages/course/video-player/page";
import NotFoundPage from '../app/not-found';


export const publicRoutes = [{
  path: '/home',
  name: 'Home',
  element: <HomePage />
},{
  path: '/courses',
  name: 'Courses',
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
  element: <InstructorAccount />
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
  element: <InstructorCreateCoursePage />
}, {
  path: '/instructor/update-course',
  name: 'Update Course',
  isNested: true,
  element: null
}, {
  path: '/instructor/*',
  name: 'Resource Not Found',
  isNested: false,
  element: <NotFoundPage />
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
  element: <AdminAllCourses />
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
}, {
  path: '/admin/*',
  name: 'Resource Not Found',
  element: <AdminNotFoundPage />
}];

export const studentRoutes = [{
  path: '/courses/:courseId/watch/:lectureId?',
  name: 'My Video Player',
  isNested: false,
  element: <VideoPlayer />
}, {
  path: '/student/courses',
  name: 'My Courses',
  isNested: true,
  element: <StudentMyCourses />
}, {
  path: '/student/cart',
  name: 'My Cart',
  isNested: false,
  element: <CartDetails />
},{
  path: '/student/checkout',
  name: 'Checkout',
  isNested: false,
  element: <Checkout />
}, {
  path: '/student/account',
  name: 'Account',
  isNested: true,
  element: <StudentAccount />
}, {
  path: '/student/payment-success',
  name: 'Payment Success',
  isNested: false,
  element: <PaymentSuccess />
}, {
  path: '/student/payment-failed',
  name: 'Failed',
  isNested: false,
  element: <PaymentFailed />
}, {
  path: '/student/payment-info',
  name: 'Payment Info',
  isNested: true,
  element: null
}, {
  path: '/student/dashboard',
  name: 'dashboard',
  isNested: true,
  element: null
}, {
  path: '/student/settings',
  name: 'Settings',
  isNested: true,
  element: null
}, {
  path: '/student/wish-list',
  name: 'Wish List',
  isNested: true,
  element: null
}, {
  path: '/student/deactivate-account',
  name: 'Deactivate Account',
  isNested: true,
  element: null
}, {
  path: '/student/become-instructor',
  name: 'Become an Instructor',
  isNested: false,
  element: null
}, {
  path: '/student/*',
  name: 'Resource Not Found',
  isNested: false,
  element: <NotFoundPage />
}];
